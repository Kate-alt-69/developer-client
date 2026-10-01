import { NextRequest, NextResponse } from "next/server";
import {
  DEVELOPER_SESSION_COOKIE,
  logoutDeveloperSession,
  sessionCookieOptions,
} from "@/lib/uac";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (sessionToken) {
    try {
      await logoutDeveloperSession(sessionToken);
    } catch {
      // Clearing the browser session remains safe even when the backend is unavailable.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEVELOPER_SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  return response;
}
