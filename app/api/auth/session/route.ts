import { NextRequest, NextResponse } from "next/server";
import {
  DEVELOPER_PORTAL_CATEGORY,
  DEVELOPER_SESSION_COOKIE,
  resolveDeveloperSession,
  sessionCookieOptions,
} from "@/lib/uac";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "unauthenticated" }, { status: 401 });
  }

  try {
    const result = await resolveDeveloperSession(sessionToken);
    if (result.body.ok !== true || !result.body.user) {
      const response = NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
      response.cookies.set(DEVELOPER_SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
      return response;
    }

    return NextResponse.json({
      ok: true,
      category: DEVELOPER_PORTAL_CATEGORY,
      expiresAt: result.body.expiresAt,
      user: result.body.user,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "uac_unavailable" }, { status: 503 });
  }
}
