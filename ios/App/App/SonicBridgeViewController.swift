import UIKit
import WebKit
import Capacitor

class SonicBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(YouTubePlayerPlugin())
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
