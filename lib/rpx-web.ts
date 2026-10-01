import "server-only";

import { KASTRICK_BACKEND } from "@/lib/config";

export const DEVELOPER_RPX_COOKIE = "rbe_developer_rpx";
const DEFAULT_RPX_SECONDS = 30 * 24 * 60 * 60;

export type RpxExchange = {
  ok: boolean;
  accessToken?: string;
  expiresAt?: number;
  scopes?: string[];
  error?: string;
};

async function readBody(response: Response): Promise<RpxExchange> {
  try {
    const body = await response.json();
    return typeof body === "object" && body !== null
      ? body as RpxExchange
      : { ok: false, error: "invalid_backend_response" };
  } catch {
    return { ok: false, error: "invalid_backend_response" };
  }
}

export async function exchangeDeveloperSession(sessionToken: string): Promise<{ status: number; body: RpxExchange }> {
  if (!sessionToken) return { status: 401, body: { ok: false, error: "invalid_session" } };
  try {
    const response = await fetch(`${KASTRICK_BACKEND.replace(/\/$/, "")}/api/rpx/auth/exchange`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionToken }),
      cache: "no-store",
    });
    return { status: response.status, body: await readBody(response) };
  } catch {
    return { status: 503, body: { ok: false, error: "rpx_auth_unavailable" } };
  }
}

export async function revokeDeveloperRpx(accessToken: string): Promise<void> {
  if (!accessToken) return;
  await fetch(`${KASTRICK_BACKEND.replace(/\/$/, "")}/api/rpx/auth/revoke`, {
    method: "POST",
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
}

export function rpxCookieOptions(expiresAt?: number) {
  const now = Math.floor(Date.now() / 1000);
  const maxAge = expiresAt && expiresAt > now
    ? Math.min(expiresAt - now, DEFAULT_RPX_SECONDS)
    : DEFAULT_RPX_SECONDS;
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function bearer(accessToken: string): string {
  return `Bearer ${accessToken}`;
}
