# RBE Developer Client

Web login/signup uses the shared backend-owned Kastrick account UI. Configure the
server-only `KASTRICK_LOGIN_API_URL`, `DEVELOPER_PORTAL_LOGIN_REDIRECT_URI`, and
`DEVELOPER_PORTAL_LOGIN_CLIENT_TOKEN` from `.env.example`, and register the exact
callback URL with kastrick-backend. See its `doc/kastrick-web-login.md` for the API
and future-service onboarding contract.

The callback verifies browser state and PKCE, issues the existing HttpOnly portal
session cookie, and clears an old RPX cookie when the account changes. RPX browser
authorization preserves its local return path through signup/login. Existing UAC
proxy settings still support session validation and RPX exchange. Desktop account
selection uses the backend's separate public device flow. Web login keeps the
credential flow.

Global profile editing is available at `/dash/account`. `/api/account/profile`
proxies the centrally stored KA name/avatar with the service identity and session
pinned server-side. Profile changes refresh on focus and while visible; drafts
survive errors and concurrent edits require an explicit refresh. The account
navigation badge uses that same profile. `/api/account/manage` opens the configured
central dashboard for service disconnects, account-wide managed storage, and
signout. A portal-only session may need to sign in to the authority first.

Validation:

```bash
npm run typecheck
node scripts/kastrick-login-smoke.cjs
node scripts/kastrick-profile-smoke.cjs
```
