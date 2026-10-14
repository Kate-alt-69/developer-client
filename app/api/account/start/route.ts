import { NextRequest, NextResponse } from "next/server";
import { loginApi, loginConfig, newLoginTransaction, transactionCookie, transactionCookieOptions } from "@/lib/kastrick-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	// A service login must be initiated deliberately in this browser, rather
	// than by a third-party form creating a connection transaction.
	if (request.headers.get("origin") !== request.nextUrl.origin) {
		return NextResponse.json({ ok: false, message: "Reload Developer Portal before signing in." }, { status: 403 });
	}
	let payload: { mode?: unknown; next?: unknown };
	try {
		if (Number(request.headers.get("content-length") || 0) > 2048) throw new Error("large request");
		const text = await request.text();
		if (Buffer.byteLength(text, "utf8") > 2048) throw new Error("large request");
		payload = JSON.parse(text);
		if (!payload || (payload.mode !== "login" && payload.mode !== "signup")) throw new Error("invalid mode");
	} catch {
		return NextResponse.json({ ok: false, message: "Choose Sign in or Create account." }, { status: 400 });
	}
	try {
		const { state, challenge, transaction } = newLoginTransaction(payload.next);
		const result = await loginApi("start", { mode: payload.mode, state, codeChallenge: challenge });
		if (!result.ok || typeof result.body.authorizationUrl !== "string") throw new Error("login start failed");
		const url = new URL(result.body.authorizationUrl);
		const config = loginConfig();
		if (url.origin !== config.authority.origin || url.pathname !== "/login" || url.username || url.password || url.hash) throw new Error("invalid authorization URL");
		const response = NextResponse.json({ ok: true, authorizationUrl: url.href }, { headers: { "Cache-Control": "no-store" } });
		response.cookies.set(transactionCookie(state), JSON.stringify(transaction), transactionCookieOptions);
		return response;
	} catch {
		return NextResponse.json({ ok: false, message: "Kastrick sign-in is temporarily unavailable. Please try again shortly." }, { status: 503, headers: { "Cache-Control": "no-store" } });
	}
}
