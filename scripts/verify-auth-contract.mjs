import { readFileSync } from "node:fs";

const files = {
  authorizePage: "app/auth/authorize/page.tsx",
  authorizeForm: "app/auth/authorize/authorize-form.tsx",
  approveRoute: "app/api/auth/rpx/approve/route.ts",
  loginForm: "app/auth/login/login-form.tsx",
  signupForm: "app/auth/signup/signup-form.tsx",
  uac: "lib/uac.ts",
};

const source = Object.fromEntries(
  Object.entries(files).map(([name, path]) => [name, readFileSync(path, "utf8")]),
);

function requireText(name, needles) {
  for (const needle of needles) {
    if (!source[name].includes(needle)) {
      throw new Error(`${files[name]} is missing auth contract: ${needle}`);
    }
  }
}

requireText("authorizePage", [
  "searchParams",
  "normalizeCode",
  "?code=",
  "DEVELOPER_SESSION_COOKIE",
  "resolveDeveloperSession(sessionToken)",
  "/auth/login?next=",
  "<AuthorizeForm userCode={code}",
]);

requireText("authorizeForm", [
  'fetch("/api/auth/rpx/approve"',
  "JSON.stringify({ userCode })",
  'router.replace("/auth/success")',
]);

requireText("approveRoute", [
  "request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value",
  "let payload: { userCode?: unknown }",
  "normalizeUserCode(payload.userCode)",
  "/api/rpx/auth/device/approve",
  "JSON.stringify({ sessionToken, userCode })",
]);

// The browser may submit only the short RPX user code. The UAC bearer session
// must come exclusively from the HttpOnly cookie read by the server route.
for (const forbidden of [
  "payload.sessionToken",
  "sessionToken?: unknown",
  "sessionToken: payload",
]) {
  if (source.approveRoute.includes(forbidden)) {
    throw new Error(`browser RPX approval must not accept a client-supplied UAC session token: ${forbidden}`);
  }
}

requireText("loginForm", [
  "function safeNextPath",
  "nextPath",
  "router.replace(destination)",
  "/auth/signup?next=",
]);
requireText("signupForm", [
  "function safeNextPath",
  "nextPath",
  "router.replace(destination)",
  "/auth/login?next=",
  'code === "account_exists"',
]);

requireText("uac", [
  'DEVELOPER_PORTAL_CATEGORY = "developer_portal"',
  'DEVELOPER_SESSION_COOKIE = "rbe_developer_session"',
  '"KASTRICK_UAC_EMAIL_INDEX_KEY"',
  'serviceId: DEVELOPER_PORTAL_CATEGORY',
]);

console.log("Developer Portal global-UAC + RPX browser authorization contract passed.");
