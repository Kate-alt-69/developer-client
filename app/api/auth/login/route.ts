import { NextRequest, NextResponse } from "next/server";
import {
  DEVELOPER_SESSION_COOKIE,
  authError,
  authFailureStatus,
  loginDeveloper,
  logoutDeveloperSession,
  safeAuthBody,
  sessionCookieOptions,
} from "@/lib/uac";
import {
  DEVELOPER_RPX_COOKIE,
  exchangeDeveloperSession,
  rpxCookieOptions,
} from "@/lib/rpx-web";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: { email?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  if (typeof payload.email !== "string" || typeof payload.password !== "string") {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  try {
    const result = await loginDeveloper({ email: payload.email, password: payload.password });
    if (result.body.ok !== true || typeof result.body.sessionToken !== "string") {
      return NextResponse.json(
        { ok: false, error: authError(result) },
        { status: authFailureStatus(result) },
      );
    }

    const sessionToken = result.body.sessionToken;
    const rpx = await exchangeDeveloperSession(sessionToken);
    if (rpx.body.ok !== true || typeof rpx.body.accessToken !== "string") {
      try {
        await logoutDeveloperSession(sessionToken);
      } catch {
        // Do not keep a half-authenticated browser session if RPX web auth is unavailable.
      }
      return NextResponse.json(
        { ok: false, error: rpx.body.error || "rpx_session_unavailable" },
        { status: rpx.status >= 400 ? rpx.status : 503 },
      );
    }

    const response = NextResponse.json(safeAuthBody(result), { status: 200 });
    response.cookies.set(
      DEVELOPER_SESSION_COOKIE,
      sessionToken,
      sessionCookieOptions(typeof result.body.expiresAt === "number" ? result.body.expiresAt : undefined),
    );
    response.cookies.set(
      DEVELOPER_RPX_COOKIE,
      rpx.body.accessToken,
      rpxCookieOptions(typeof rpx.body.expiresAt === "number" ? rpx.body.expiresAt : undefined),
    );
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "authentication_failed";
    const status = code.startsWith("invalid_") ? 400 : 503;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
