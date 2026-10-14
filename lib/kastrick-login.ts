import { createHash, randomBytes } from "node:crypto";

export const DEVELOPER_SERVICE_ID = "developer_portal";
export const DEVELOPER_SESSION_COOKIE = "rbe_developer_session";
export const LOGIN_TTL_SECONDS = 600;

export interface LoginTransaction {
	verifier: string;
	next: string;
	expiresAt: number;
}

function requiredEnv(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) throw new Error("Kastrick login is not configured for Developer Portal.");
	return value;
}

/** Deployments pin the callback and login authority; neither comes from Host
 * headers, browser input, or an upstream response's arbitrary destination. */
export function loginConfig() {
	const authority = new URL(requiredEnv("KASTRICK_LOGIN_API_URL"));
	const redirectUri = new URL(requiredEnv("DEVELOPER_PORTAL_LOGIN_REDIRECT_URI"));
	for (const url of [authority, redirectUri]) {
		const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
		if ((url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) || url.username || url.password || url.search || url.hash) {
			throw new Error("Kastrick login URLs must use HTTPS and contain no credentials or query parameters.");
		}
	}
	if (authority.pathname !== "/" || redirectUri.pathname !== "/api/account/callback") {
		throw new Error("Kastrick login authority or callback URL is invalid.");
	}
	const clientToken = requiredEnv("DEVELOPER_PORTAL_LOGIN_CLIENT_TOKEN");
	if (clientToken.length < 32) throw new Error("Kastrick login client token must be at least 32 characters.");
	return { authority, redirectUri: redirectUri.href, clientToken };
}

export function safeReturnPath(value: unknown): string {
	if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return "/dash";
	const parsed = new URL(value, "https://portal.invalid");
	if (parsed.origin !== "https://portal.invalid" || parsed.pathname.startsWith("/api/") || parsed.pathname.startsWith("/auth/login")) return "/dash";
	return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function newLoginTransaction(next: unknown, now = Date.now()) {
	const state = randomBytes(32).toString("base64url");
	const verifier = randomBytes(32).toString("base64url");
	return {
		state,
		challenge: createHash("sha256").update(verifier).digest("base64url"),
		transaction: { verifier, next: safeReturnPath(next), expiresAt: Math.floor(now / 1000) + LOGIN_TTL_SECONDS },
	};
}

export function validLoginState(value: string | null): value is string {
	return typeof value === "string" && /^[A-Za-z0-9_-]{43}$/.test(value);
}

export function transactionCookie(state: string): string {
	return `kastrick-login-${state}`;
}

export function readLoginTransaction(value: string | undefined, now = Date.now()): LoginTransaction | undefined {
	try {
		const transaction = JSON.parse(value ?? "") as LoginTransaction;
		if (!transaction || typeof transaction.verifier !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(transaction.verifier) || !Number.isSafeInteger(transaction.expiresAt) || transaction.expiresAt <= Math.floor(now / 1000)) return undefined;
		return { ...transaction, next: safeReturnPath(transaction.next) };
	} catch {
		return undefined;
	}
}

export const transactionCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax" as const,
	path: "/api/account",
	maxAge: LOGIN_TTL_SECONDS,
};

/** Only the service server holds its client credential and PKCE verifier. */
export async function loginApi(action: "start" | "exchange" | "profile", body: Record<string, unknown>) {
	const config = loginConfig();
	const response = await fetch(new URL(`/v1/login/${action}`, config.authority), {
		method: "POST",
		headers: { Authorization: `Bearer ${config.clientToken}`, "Content-Type": "application/json" },
		body: JSON.stringify({ ...body, serviceId: DEVELOPER_SERVICE_ID, ...(action === "profile" ? {} : { redirectUri: config.redirectUri }) }),
		cache: "no-store",
		redirect: "error",
		signal: AbortSignal.timeout(30_000),
	});
	let result: Record<string, unknown> = {};
	try {
		const parsed: unknown = await response.json();
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) result = parsed as Record<string, unknown>;
	} catch { /* Invalid upstream responses remain failures without exposing raw HTML. */ }
	return { ok: response.ok && result.ok === true, status: response.status, body: result };
}
