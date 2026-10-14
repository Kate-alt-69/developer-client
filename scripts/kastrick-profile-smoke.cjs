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
const { GET, PATCH } = require("../app/api/account/profile/route.ts");
process.env.KASTRICK_LOGIN_API_URL = "http://localhost:4100";
process.env.DEVELOPER_PORTAL_LOGIN_REDIRECT_URI = "http://localhost:3100/api/account/callback";
process.env.DEVELOPER_PORTAL_LOGIN_CLIENT_TOKEN = "test-only-client-credential-with-32-characters";
const origin = "http://localhost:3100";
const savedFetch = global.fetch;
let calls = [];
let status = 200;
global.fetch = async (url, init) => { calls.push(JSON.parse(init.body)); return new Response(JSON.stringify(status === 200 ? { ok: true, profile: { displayName: "Ada", revision: 2 }, avatarUrl: "http://localhost:4100/avatars/test" } : { ok: false, error: "profile_changed" }), { status }); };
async function main() {
	assert.equal((await GET(new NextRequest(`${origin}/api/account/profile`))).status, 401);
	assert.equal(calls.length, 0);
	const headers = { origin, cookie: "rbe_developer_session=server-session", "content-type": "application/json" };
	let response = await PATCH(new NextRequest(`${origin}/api/account/profile`, { method: "PATCH", headers, body: JSON.stringify({ displayName: "Ada", avatarTone: "cyan", expectedRevision: 1, sessionToken: "attacker-session", serviceId: "other", userId: "victim" }) }));
	assert.equal(response.status, 200); assert.equal(calls[0].sessionToken, "server-session"); assert.equal(calls[0].serviceId, "developer_portal"); assert.equal(calls[0].userId, undefined); assert.equal(calls[0].expectedRevision, 1); assert.deepEqual(Object.keys(calls[0]).sort(), ["action", "avatarTone", "displayName", "expectedRevision", "serviceId", "sessionToken"].sort());
	calls = [];
	response = await PATCH(new NextRequest(`${origin}/api/account/profile`, { method: "PATCH", headers: { ...headers, origin: "https://evil.example" }, body: "{}" }));
	assert.equal(response.status, 403); assert.equal(calls.length, 0);
	status = 409;
	response = await PATCH(new NextRequest(`${origin}/api/account/profile`, { method: "PATCH", headers, body: JSON.stringify({ displayName: "Draft", avatarTone: "rose", expectedRevision: 1 }) }));
	assert.equal(response.status, 409); assert.match((await response.json()).message, /changed in another service/);
	console.log("KA profile proxy cookie identity, CSRF origin and stale-revision checks passed.");
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => global.fetch = savedFetch);
