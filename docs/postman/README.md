# Sonic Search Postman QA

Use this collection to test the public API surface before inviting beta users.

## Import

1. Open Postman.
2. Click `Import`.
3. Import `docs/postman/sonic-search.postman_collection.json`.
4. Import `docs/postman/sonic-search.postman_environment.json`.
5. Select the `Sonic Search - Production` environment.

## Recommended Run Order

1. Run `Core smoke - safe`.
2. Run `Current production blockers`.
3. Run `Write and gated checks` only when you intentionally want to write waitlist/analytics data or test a real beta code.
4. Run `Quota checks - run intentionally` only when you accept spending provider/API quota.

## Expected Signals

- `200`: route is healthy.
- `400 invalid_email`: expected for the invalid waitlist guard.
- `403 invalid_code`: expected for the invalid beta code guard.
- `503 durable_rate_limit_required`: production env is missing KV/Upstash while `SONIC_REQUIRE_DURABLE_RATE_LIMITS=true`.
- `403 origin_not_allowed`: the request is missing the `Origin: https://sonicsearch.app` header or the Vercel allowed origins are wrong.

## Variables

- `base_url`: defaults to `https://sonicsearch.app`.
- `origin`: defaults to `https://sonicsearch.app`.
- `beta_code`: replace with a real code before running the real beta grant request.
- `waitlist_email`: replace before running the write test if you want a real row.

Do not paste service role keys, OpenAI keys, or provider secrets into Postman for this collection. These routes should be tested through backend env vars only.
