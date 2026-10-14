import { NextRequest, NextResponse } from "next/server";
import { loginApi, DEVELOPER_SESSION_COOKIE } from "@/lib/kastrick-login";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function dispatch(request: NextRequest, update: boolean) {
	if (update && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ ok: false, message: "Reload this page before saving." }, { status: 403 });
	const token = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
	if (!token) return NextResponse.json({ ok: false, message: "Sign in to edit your Kastrick profile." }, { status: 401 });
	let edits: Record<string, unknown> = {};
	if (update) {
		try {
			const text = await request.text(); if (Buffer.byteLength(text, "utf8") > 2048) throw new Error("large profile");
			const payload = JSON.parse(text);
			if (!payload || typeof payload.displayName !== "string" || payload.displayName.length > 160 || typeof payload.avatarTone !== "string" || !Number.isSafeInteger(payload.expectedRevision) || payload.expectedRevision < 0) throw new Error("invalid profile");
			edits = { displayName: payload.displayName, avatarTone: payload.avatarTone, expectedRevision: payload.expectedRevision };
		} catch { return NextResponse.json({ ok: false, message: "Enter a display name and choose an avatar color." }, { status: 400 }); }
	}
	try {
		// Ignore browser-supplied identities/tokens: the service and session come
		// exclusively from deployment configuration and the HttpOnly cookie.
		const result = await loginApi("profile", { action: update ? "updateProfile" : "getProfile", sessionToken: token, ...edits });
		const message = result.status === 409 ? "Your profile changed in another service. Refresh it before saving; your input has been kept." : result.status === 401 ? "Your session expired. Sign in again." : result.status === 400 ? "Use a name of 1–80 characters and choose an avatar color." : "Kastrick accounts are temporarily unavailable.";
		return NextResponse.json(result.ok ? { ok: true, profile: result.body.profile, avatarUrl: result.body.avatarUrl, storage: result.body.storage } : { ok: false, message }, { status: result.ok ? 200 : result.status >= 400 ? result.status : 502, headers: { "Cache-Control": "no-store" } });
	} catch { return NextResponse.json({ ok: false, message: "Kastrick accounts are temporarily unavailable." }, { status: 503 }); }
}
export function GET(request: NextRequest) { return dispatch(request, false); }
export function PATCH(request: NextRequest) { return dispatch(request, true); }
