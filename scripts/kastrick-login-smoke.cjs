// Test the real route handlers with an isolated upstream stub. The short
// browser return code must never become a browser-readable account bearer.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const Module = require("node:module");
const root = path.resolve(__dirname, "..");
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
	if (name === "server-only") return {};
	if (name.startsWith("@/")) name = path.join(root, name.slice(2));
	return originalLoad.call(this, name, parent, isMain);
};
require.extensions[".ts"] = (module, filename) => {
	module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
		fileName: filename,
		compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
	}).outputText, filename);
};
const assert = require("node:assert/strict");
const { NextRequest } = require("next/server");
const { POST: start } = require("../app/api/account/start/route.ts");
const { GET: callback } = require("../app/api/account/callback/route.ts");
const { newLoginTransaction, safeReturnPath, transactionCookie } = require("../lib/kastrick-login.ts");
process.env.KASTRICK_LOGIN_API_URL = "http://localhost:4100";
process.env.DEVELOPER_PORTAL_LOGIN_REDIRECT_URI = "http://localhost:3200/api/account/callback";
process.env.DEVELOPER_PORTAL_LOGIN_CLIENT_TOKEN = "test-only-client-credential-with-32-characters";
const origin = "http://localhost:3200";
const realFetch = global.fetch;
let calls = [];
let body = { ok: true, authorizationUrl: "http://localhost:4100/login?request=test" };
global.fetch = async (url, init) => {
	calls.push({ url: String(url), payload: JSON.parse(init.body) });
	return new Response(JSON.stringify(body), { status: body.ok ? 200 : 400 });
};
async function main() {
	assert.equal(safeReturnPath("/\\evil.example"), "/dash");
	const next = "/auth/authorize?code=ABCD1234";
	const started = await start(new NextRequest(`${origin}/api/account/start`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify({ mode: "login", next }) }));
	assert.equal(started.status, 200);
	assert.equal(calls[0].payload.serviceId, "developer_portal");
	const { state, transaction } = newLoginTransaction(next);
	const cookie = `${transactionCookie(state)}=${encodeURIComponent(JSON.stringify(transaction))}`;
	const url = `${origin}/api/account/callback?state=${state}&code=${"a".repeat(64)}`;
	calls = [];
	await callback(new NextRequest(url));
	assert.equal(calls.length, 0);
	body = { ok: true, serviceId: "developer_portal", sessionToken: "test-only-service-session", expiresAt: Math.floor(Date.now() / 1000) + 1000 };
	const result = await callback(new NextRequest(url, { headers: { cookie } }));
	assert.equal(result.headers.get("location"), `${origin}${next}`);
	assert.equal(result.cookies.get("rbe_developer_session").value, "test-only-service-session");
	assert.equal(result.cookies.get("rbe_developer_rpx").maxAge, 0);
	assert.equal(result.cookies.get(transactionCookie(state)).maxAge, 0);
	assert.equal(calls[0].payload.codeVerifier, transaction.verifier);
	body = { ok: false, error: "invalid_grant" };
	const replay = await callback(new NextRequest(url, { headers: { cookie } }));
	assert.equal(replay.cookies.get("rbe_developer_session"), undefined);
	assert.match(replay.headers.get("location"), /connection_failed/);
	console.log("Developer Portal shared web-login state, PKCE, RPX return and account-switch checks passed.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { global.fetch = realFetch; Module._load = originalLoad; });
