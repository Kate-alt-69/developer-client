import { NextRequest, NextResponse } from "next/server";
import {
  DEVELOPER_SESSION_COOKIE,
  logoutDeveloperSession,
  sessionCookieOptions,
} from "@/lib/uac";
import {
  DEVELOPER_RPX_COOKIE,
  revokeDeveloperRpx,
  rpxCookieOptions,
} from "@/lib/rpx-web";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
  const rpxToken = request.cookies.get(DEVELOPER_RPX_COOKIE)?.value;

  if (rpxToken) {
    try {
      await revokeDeveloperRpx(rpxToken);
    } catch {
      // Local logout still clears the derived RPX credential if Kastrick is unavailable.
    }
  }

  if (sessionToken) {
    try {
      await logoutDeveloperSession(sessionToken);
    } catch {
      // Clearing the browser session remains safe even when the backend is unavailable.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEVELOPER_SESSION_COOKIE, "", { ...sessionCookieOptions(), maxAge: 0 });
  response.cookies.set(DEVELOPER_RPX_COOKIE, "", { ...rpxCookieOptions(), maxAge: 0 });
  return response;
}
