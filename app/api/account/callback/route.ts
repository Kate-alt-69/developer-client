import { DEVELOPER_RPX_COOKIE } from "@/lib/rpx-web";
import { NextRequest, NextResponse } from "next/server";
import { loginApi, loginConfig, readLoginTransaction, DEVELOPER_SERVICE_ID, DEVELOPER_SESSION_COOKIE, transactionCookie, transactionCookieOptions, validLoginState } from "@/lib/kastrick-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
	const state = request.nextUrl.searchParams.get("state");
	const validState = validLoginState(state);
	const transaction = validState ? readLoginTransaction(request.cookies.get(transactionCookie(state))?.value) : undefined;
	let returnOrigin = request.nextUrl.origin;
	let response: NextResponse;
	try {
		// Use the deployment-pinned origin for all redirects after configuration
		// resolves, so forwarded Host headers cannot choose a return destination.
		returnOrigin = new URL(loginConfig().redirectUri).origin;
		if (!transaction) throw new Error("invalid_state");
		if (request.nextUrl.searchParams.has("error")) throw new Error("cancelled");
		const code = request.nextUrl.searchParams.get("code");
		if (!code || !/^[a-f0-9]{64}$/.test(code)) throw new Error("invalid_code");
		const result = await loginApi("exchange", { code, codeVerifier: transaction.verifier });
		const token = result.body.sessionToken;
		const expiresAt = result.body.expiresAt;
		const now = Math.floor(Date.now() / 1000);
		if (!result.ok || result.body.serviceId !== DEVELOPER_SERVICE_ID || typeof token !== "string" || !token || token.length > 4096 || typeof expiresAt !== "number" || !Number.isSafeInteger(expiresAt) || expiresAt <= now) throw new Error("exchange_failed");
		response = NextResponse.redirect(new URL(transaction.next, returnOrigin), 303);
		// Clear an old RPX credential when switching KA accounts. Subsequent
		// package requests exchange the new service session for the new owner.
		response.cookies.set(DEVELOPER_RPX_COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
		response.cookies.set(DEVELOPER_SESSION_COOKIE, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: Math.min(expiresAt - now, 30 * 24 * 60 * 60),
		});
	} catch (error) {
		const target = new URL("/auth/login", returnOrigin);
		target.searchParams.set("error", error instanceof Error && error.message === "cancelled" ? "cancelled" : "connection_failed");
		if (transaction) target.searchParams.set("next", transaction.next);
		response = NextResponse.redirect(target, 303);
	}
	if (validState) response.cookies.set(transactionCookie(state), "", { ...transactionCookieOptions, maxAge: 0 });
	response.headers.set("Cache-Control", "no-store");
	response.headers.set("Referrer-Policy", "no-referrer");
	return response;
}
