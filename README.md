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
selection and the KA dashboard are separate next-task work.
