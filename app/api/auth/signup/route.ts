import { NextRequest, NextResponse } from "next/server";
import {
  DEVELOPER_SESSION_COOKIE,
  authError,
  authFailureStatus,
  safeAuthBody,
  sessionCookieOptions,
  signupDeveloper,
} from "@/lib/uac";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let payload: { email?: string; password?: string; username?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  if (
    typeof payload.email !== "string" ||
    typeof payload.password !== "string" ||
    typeof payload.username !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  try {
    const result = await signupDeveloper({
      email: payload.email,
      password: payload.password,
      username: payload.username,
    });

    if (result.body.ok !== true || typeof result.body.sessionToken !== "string") {
      return NextResponse.json(
        { ok: false, error: authError(result) },
        { status: authFailureStatus(result) },
      );
    }

    const response = NextResponse.json(safeAuthBody(result), {
      status: result.body.created === true ? 201 : 200,
    });
    response.cookies.set(
      DEVELOPER_SESSION_COOKIE,
      result.body.sessionToken,
      sessionCookieOptions(typeof result.body.expiresAt === "number" ? result.body.expiresAt : undefined),
    );
    return response;
  } catch (error) {
    const code = error instanceof Error ? error.message : "signup_failed";
    const status = code.startsWith("invalid_") ? 400 : 503;
    return NextResponse.json({ ok: false, error: code }, { status });
  }
}
