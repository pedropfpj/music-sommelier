import UIKit
import WebKit
import Capacitor
import UserNotifications
import StoreKit

class SonicBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(YouTubePlayerPlugin())
        bridge?.registerPluginInstance(DailyDjReminderPlugin())
        bridge?.registerPluginInstance(SonicSubscriptionsPlugin())
    }
}

@objc(SonicSubscriptionsPlugin)
public final class SonicSubscriptionsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SonicSubscriptionsPlugin"
    public let jsName = "SonicSubscriptions"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "products", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "manage", returnType: CAPPluginReturnPromise)
    ]

    private let monthlyProductID = "app.sonicsearch.ios.premium.monthly"
    private let yearlyProductID = "app.sonicsearch.ios.premium.yearly"

    private var productIDs: [String] {
        [monthlyProductID, yearlyProductID]
    }

    private func cadence(for productID: String) -> String {
        productID == yearlyProductID ? "yearly" : "monthly"
    }

    private func resolve(_ call: CAPPluginCall, _ payload: [String: Any]) async {
        await MainActor.run { call.resolve(payload) }
    }

    private func reject(_ call: CAPPluginCall, _ message: String) async {
        await MainActor.run { call.reject(message) }
    }

    private func approximateTrialDays(_ offer: Product.SubscriptionOffer) -> Int {
        let units = offer.period.value * offer.periodCount
        switch offer.period.unit {
        case .day: return units
        case .week: return units * 7
        case .month: return units * 30
        case .year: return units * 365
        @unknown default: return 0
        }
    }

    private func productPayload(_ product: Product) async -> [String: Any] {
        var payload: [String: Any] = [
            "id": product.id,
            "cadence": cadence(for: product.id),
            "name": product.displayName,
            "description": product.description,
            "displayPrice": product.displayPrice
        ]
        if let period = product.subscription?.subscriptionPeriod {
            payload["periodValue"] = period.value
            switch period.unit {
            case .day: payload["periodUnit"] = "day"
            case .week: payload["periodUnit"] = "week"
            case .month: payload["periodUnit"] = "month"
            case .year: payload["periodUnit"] = "year"
            @unknown default: payload["periodUnit"] = "unknown"
            }
        }
        if let subscription = product.subscription,
           let offer = subscription.introductoryOffer,
           offer.paymentMode == .freeTrial {
            payload["trialEligible"] = await subscription.isEligibleForIntroOffer
            payload["trialDays"] = approximateTrialDays(offer)
        }
        return payload
    }

    private func verifiedEntitlementPayload() async -> [String: Any] {
        var activeTransaction: Transaction?
        var signedTransaction: String?
        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            guard productIDs.contains(transaction.productID), transaction.revocationDate == nil else { continue }
            if let expirationDate = transaction.expirationDate, expirationDate <= Date() { continue }
            if activeTransaction == nil || (transaction.expirationDate ?? .distantFuture) > (activeTransaction?.expirationDate ?? .distantPast) {
                activeTransaction = transaction
                signedTransaction = result.jwsRepresentation
            }
        }
        guard let transaction = activeTransaction else {
            return ["active": false, "provider": "apple"]
        }
        var payload: [String: Any] = [
            "active": true,
            "provider": "apple",
            "productId": transaction.productID,
            "transactionId": String(transaction.id),
            "originalTransactionId": String(transaction.originalID)
        ]
        if let expirationDate = transaction.expirationDate {
            payload["currentPeriodEnd"] = ISO8601DateFormatter().string(from: expirationDate)
        }
        if let signedTransaction {
            payload["signedTransaction"] = signedTransaction
        }
        return payload
    }

    @objc public func products(_ call: CAPPluginCall) {
        Task {
            do {
                let products = try await Product.products(for: productIDs)
                let ordered = products.sorted { cadence(for: $0.id) < cadence(for: $1.id) }
                var payloads: [[String: Any]] = []
                for product in ordered {
                    payloads.append(await productPayload(product))
                }
                await resolve(call, ["products": payloads])
            } catch {
                await reject(call, error.localizedDescription)
            }
        }
    }

    @objc public func status(_ call: CAPPluginCall) {
        Task { await resolve(call, await verifiedEntitlementPayload()) }
    }

    @objc public func purchase(_ call: CAPPluginCall) {
        let productID = call.getString("productId")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        let accountTokenValue = call.getString("appAccountToken")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard productIDs.contains(productID) else {
            call.reject("This subscription product is not available.")
            return
        }
        guard let accountToken = UUID(uuidString: accountTokenValue) else {
            call.reject("Sign in before purchasing Sonic Premium.")
            return
        }
        Task {
            do {
                guard let product = try await Product.products(for: [productID]).first else {
                    await reject(call, "This subscription is not available in the App Store.")
                    return
                }
                let result = try await product.purchase(options: [.appAccountToken(accountToken)])
                switch result {
                case .success(let verification):
                    guard case .verified(let transaction) = verification else {
                        await reject(call, "The App Store transaction could not be verified.")
                        return
                    }
                    let signedTransaction = verification.jwsRepresentation
                    await transaction.finish()
                    var payload = await verifiedEntitlementPayload()
                    payload["signedTransaction"] = signedTransaction
                    payload["pending"] = false
                    await resolve(call, payload)
                case .pending:
                    await resolve(call, ["active": false, "pending": true, "provider": "apple"])
                case .userCancelled:
                    await resolve(call, ["active": false, "cancelled": true, "provider": "apple"])
                @unknown default:
                    await reject(call, "The App Store returned an unknown purchase state.")
                }
            } catch {
                await reject(call, error.localizedDescription)
            }
        }
    }

    @objc public func restore(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()
                await resolve(call, await verifiedEntitlementPayload())
            } catch {
                await reject(call, error.localizedDescription)
            }
        }
    }

    @objc public func manage(_ call: CAPPluginCall) {
        Task {
            do {
                guard let scene = await MainActor.run(body: {
                    UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }.first
                }) else {
                    await reject(call, "Subscription settings are unavailable right now.")
                    return
                }
                try await AppStore.showManageSubscriptions(in: scene)
                await resolve(call, ["opened": true])
            } catch {
                await reject(call, error.localizedDescription)
            }
        }
    }
}

/// Device-local, opt-in reminder. Release builds keep the reminder disabled;
/// subscription access is handled separately through verified StoreKit data.
@objc(DailyDjReminderPlugin)
public final class DailyDjReminderPlugin: CAPPlugin, CAPBridgedPlugin, NotificationHandlerProtocol {
    public let identifier = "DailyDjReminderPlugin"
    public let jsName = "DailyDjReminder"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "configure", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "cancel", returnType: CAPPluginReturnPromise)
    ]
    private let reminderID = "sonic.daily-dj.reminder"
    private var generation = 0
    private var configuring = false

    private var developmentPreview: Bool {
        #if DEBUG
        return true
        #else
        return false
        #endif
    }

    public override func load() {
        bridge?.notificationRouter.localNotificationHandler = self
        if !developmentPreview {
            UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: [reminderID])
        }
    }

    public func willPresent(notification: UNNotification) -> UNNotificationPresentationOptions {
        guard developmentPreview, notification.request.identifier == reminderID else { return [] }
        return [.banner, .sound]
    }

    public func didReceive(response: UNNotificationResponse) {
        guard developmentPreview,
              response.notification.request.identifier == reminderID,
              response.actionIdentifier == UNNotificationDefaultActionIdentifier else { return }
        notifyListeners("openDailySelection", data: [:], retainUntilConsumed: true)
    }

    @objc public func status(_ call: CAPPluginCall) {
        let center = UNUserNotificationCenter.current()
        center.getNotificationSettings { settings in
            center.getPendingNotificationRequests { requests in
                let request = requests.first { $0.identifier == self.reminderID }
                let date = (request?.trigger as? UNCalendarNotificationTrigger)?.dateComponents
                let allowed = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
                call.resolve([
                    "developmentPreview": self.developmentPreview,
                    "enabled": request != nil && allowed,
                    "denied": settings.authorizationStatus == .denied,
                    "time": String(format: "%02d:%02d", date?.hour ?? 19, date?.minute ?? 0)
                ])
            }
        }
    }

    @objc public func configure(_ call: CAPPluginCall) {
        guard developmentPreview else {
            call.reject("Daily recommendations are not available for purchase yet.")
            return
        }
        let time = call.getString("time") ?? ""
        guard time.range(of: #"^(?:[01][0-9]|2[0-3]):[0-5][0-9]$"#, options: .regularExpression) != nil else {
            call.reject("Choose a valid local time.")
            return
        }
        let parts = time.split(separator: ":").compactMap { Int($0) }
        let language = call.getString("language") ?? "en"
        DispatchQueue.main.async {
            guard !self.configuring else { call.reject("A reminder update is already in progress."); return }
            self.configuring = true
            self.generation += 1
            let requestGeneration = self.generation
            let center = UNUserNotificationCenter.current()
            // Only called after an explicit tap on Enable reminder, never at boot.
            center.requestAuthorization(options: [.alert, .sound]) { allowed, error in
                DispatchQueue.main.async {
                    guard self.generation == requestGeneration else {
                        self.configuring = false
                        call.reject("Reminder update was cancelled.")
                        return
                    }
                    if let error = error { self.configuring = false; call.reject(error.localizedDescription); return }
                    guard allowed else { self.configuring = false; self.status(call); return }
                    let content = UNMutableNotificationContent()
                    content.title = language == "pt" ? "Recomendação Premium" : language == "es" ? "Recomendación Premium" : "Premium Recommendations"
                    content.body = language == "pt" ? "Reserve um momento para descobrir DJs no Sonic Search." : language == "es" ? "Reserva un momento para descubrir DJs en Sonic Search." : "Take a moment to discover DJs in Sonic Search."
                    content.sound = .default
                    var components = DateComponents()
                    components.hour = parts[0]
                    components.minute = parts[1]
                    // Calendar matching follows the device's local clock, including DST.
                    let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
                    let request = UNNotificationRequest(identifier: self.reminderID, content: content, trigger: trigger)
                    center.add(request) { error in
                        DispatchQueue.main.async {
                            self.configuring = false
                            if self.generation != requestGeneration {
                                center.removePendingNotificationRequests(withIdentifiers: [self.reminderID])
                                call.reject("Reminder update was cancelled.")
                            } else if let error = error {
                                call.reject(error.localizedDescription)
                            } else {
                                self.status(call)
                            }
                        }
                    }
                }
            }
        }
    }

    @objc public func cancel(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.generation += 1
            let center = UNUserNotificationCenter.current()
            center.removePendingNotificationRequests(withIdentifiers: [self.reminderID])
            center.removeDeliveredNotifications(withIdentifiers: [self.reminderID])
            call.resolve(["enabled": false, "time": "19:00", "developmentPreview": self.developmentPreview])
        }
    }
}

@objc(YouTubePlayerPlugin)
public final class YouTubePlayerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "YouTubePlayerPlugin"
    public let jsName = "YouTubePlayer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise)
    ]

    @objc public func open(_ call: CAPPluginCall) {
        let videoID = call.getString("videoId")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        guard videoID.range(of: #"^[A-Za-z0-9_-]{11}$"#, options: .regularExpression) != nil else {
            call.reject("Invalid YouTube video ID.")
            return
        }

        let playerTitle = call.getString("title")?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        DispatchQueue.main.async { [weak self] in
            guard let presenter = self?.bridge?.viewController else {
                call.reject("The native player is unavailable.")
                return
            }

            let player = SonicYouTubePlayerViewController(videoID: videoID, playerTitle: playerTitle)
            let navigation = UINavigationController(rootViewController: player)
            navigation.modalPresentationStyle = .fullScreen
            presenter.present(navigation, animated: true) {
                call.resolve()
            }
        }
    }
}

private final class SonicYouTubePlayerViewController: UIViewController, WKNavigationDelegate, WKUIDelegate {
    private let videoID: String
    private let playerTitle: String
    private var webView: WKWebView!

    init(videoID: String, playerTitle: String) {
        self.videoID = videoID
        self.playerTitle = playerTitle
        super.init(nibName: nil, bundle: nil)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        title = playerTitle.isEmpty ? "YouTube" : playerTitle
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            title: "Fechar",
            style: .done,
            target: self,
            action: #selector(closePlayer)
        )
        configureNavigationBar()
        configureWebView()
        loadPlayer()
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)
        webView?.stopLoading()
        webView?.loadHTMLString("", baseURL: nil)
    }

    private func configureNavigationBar() {
        let appearance = UINavigationBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(red: 0.01, green: 0.035, blue: 0.075, alpha: 1)
        appearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navigationController?.navigationBar.standardAppearance = appearance
        navigationController?.navigationBar.scrollEdgeAppearance = appearance
        navigationController?.navigationBar.compactAppearance = appearance
        navigationController?.navigationBar.tintColor = UIColor(red: 0.49, green: 1, blue: 0.91, alpha: 1)
    }

    private func configureWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor)
        ])
    }

    private func loadPlayer() {
        let bundleID = (Bundle.main.bundleIdentifier ?? "app.sonicsearch.ios").lowercased()
        let clientIdentity = "https://\(bundleID)"
        guard let baseURL = URL(string: clientIdentity) else { return }

        var components = URLComponents()
        components.queryItems = [
            URLQueryItem(name: "autoplay", value: "1"),
            URLQueryItem(name: "playsinline", value: "1"),
            URLQueryItem(name: "rel", value: "0"),
            URLQueryItem(name: "enablejsapi", value: "1"),
            URLQueryItem(name: "origin", value: clientIdentity)
        ]
        let query = components.percentEncodedQuery ?? ""
        let embedURL = "https://www.youtube.com/embed/\(videoID)?\(query)"
        let html = """
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
            <meta name="referrer" content="strict-origin-when-cross-origin">
            <style>
              html, body { width: 100%; height: 100%; margin: 0; background: #000; overflow: hidden; }
              iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; }
            </style>
          </head>
          <body>
            <iframe
              src="\(embedURL)"
              title="YouTube"
              referrerpolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen>
            </iframe>
          </body>
        </html>
        """

        // YouTube requires a valid HTTPS Referer for WebView embeds. Supplying the
        // App Store bundle ID as baseURL makes WKWebView send the required identity.
        webView.loadHTMLString(html, baseURL: baseURL)
    }

    @objc private func closePlayer() {
        dismiss(animated: true)
    }

    func webView(
        _ webView: WKWebView,
        createWebViewWith configuration: WKWebViewConfiguration,
        for navigationAction: WKNavigationAction,
        windowFeatures: WKWindowFeatures
    ) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
            UIApplication.shared.open(url)
        }
        return nil
    }
}
