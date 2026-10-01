import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { KASTRICK_BACKEND } from "@/lib/config";
import { DEVELOPER_SESSION_COOKIE } from "@/lib/uac";
import {
  DEVELOPER_RPX_COOKIE,
  bearer,
  exchangeDeveloperSession,
  rpxCookieOptions,
} from "@/lib/rpx-web";

type RefreshedCredential = {
  accessToken: string;
  expiresAt?: number;
};

async function exchangeFromRequest(request: NextRequest): Promise<RefreshedCredential | undefined> {
  const sessionToken = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (!sessionToken) return undefined;
  const exchanged = await exchangeDeveloperSession(sessionToken);
  if (exchanged.body.ok !== true || typeof exchanged.body.accessToken !== "string") return undefined;
  return {
    accessToken: exchanged.body.accessToken,
    expiresAt: typeof exchanged.body.expiresAt === "number" ? exchanged.body.expiresAt : undefined,
  };
}

async function requestBackend(path: string, accessToken: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("authorization", bearer(accessToken));
  return fetch(`${KASTRICK_BACKEND.replace(/\/$/, "")}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function developerBackendRequest(
  request: NextRequest,
  path: string,
  init?: RequestInit,
): Promise<{ upstream?: Response; refreshed?: RefreshedCredential; error?: string }> {
  let accessToken = request.cookies.get(DEVELOPER_RPX_COOKIE)?.value;
  let refreshed: RefreshedCredential | undefined;

  if (!accessToken) {
    refreshed = await exchangeFromRequest(request);
    accessToken = refreshed?.accessToken;
  }
  if (!accessToken) return { error: "invalid_session" };

  let upstream = await requestBackend(path, accessToken, init);
  if (upstream.status === 401) {
    refreshed = await exchangeFromRequest(request);
    if (!refreshed) return { upstream, error: "invalid_session" };
    accessToken = refreshed.accessToken;
    upstream = await requestBackend(path, accessToken, init);
  }

  return { upstream, refreshed };
}

export async function relayDeveloperResponse(
  result: { upstream?: Response; refreshed?: RefreshedCredential; error?: string },
): Promise<NextResponse> {
  if (!result.upstream) {
    return NextResponse.json({ ok: false, error: result.error || "developer_api_unavailable" }, { status: 401 });
  }

  const text = await result.upstream.text();
  let body: unknown = { ok: result.upstream.ok };
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { ok: false, error: "invalid_backend_response" };
    }
  }

  const response = NextResponse.json(body, { status: result.upstream.status });
  if (result.refreshed) {
    response.cookies.set(
      DEVELOPER_RPX_COOKIE,
      result.refreshed.accessToken,
      rpxCookieOptions(result.refreshed.expiresAt),
    );
  }
  return response;
}
