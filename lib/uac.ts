import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { KASTRICK_BACKEND } from "@/lib/config";

export const DEVELOPER_PORTAL_CATEGORY = "developer_portal";
export const DEVELOPER_SESSION_COOKIE = "rbe_developer_session";

const DEFAULT_SESSION_SECONDS = 30 * 24 * 60 * 60;

type UacBody = Record<string, unknown> & {
  ok?: boolean;
  error?: string;
  userId?: string;
  serviceId?: string;
  category?: string;
  sessionToken?: string;
  expiresAt?: number;
  created?: boolean;
  user?: Record<string, unknown>;
};

export type UacResult = {
  status: number;
  body: UacBody;
};

export type DeveloperCredentials = {
  email: string;
  password: string;
  username?: string;
};

function requiredSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.length < 16) {
    throw new Error(`${name} is missing or too short`);
  }
  return value;
}

function globalIdentitySecret(globalName: string, legacyName: string): string {
  const globalValue = process.env[globalName]?.trim();
  if (globalValue) {
    if (globalValue.length < 16) throw new Error(`${globalName} is too short`);
    return globalValue;
  }

  // Temporary compatibility fallback. A global UAC identity must eventually use
  // one stable key across every server-side Kastrick application. Existing
  // Developer Portal deployments can continue booting while that secret is
  // rolled out, but the legacy key must be identical to the other application's
  // global identity key if accounts are expected to resolve cross-service.
  const legacyValue = process.env[legacyName]?.trim();
  if (!legacyValue || legacyValue.length < 16) {
    throw new Error(`${globalName} is missing (legacy fallback ${legacyName} is also unavailable)`);
  }
  return legacyValue;
}

function normalizeEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }
  return email;
}

function normalizeUsername(value: string): string {
  const username = value.normalize("NFKC").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,31}$/.test(username)) {
    throw new Error("invalid_username");
  }
  return username;
}

function validatePassword(value: string): string {
  if (value.length < 8 || value.length > 1024) {
    throw new Error("invalid_password");
  }
  return value;
}

function opaqueLookup(globalName: string, legacyName: string, value: string): string {
  const key = globalIdentitySecret(globalName, legacyName);
  return createHmac("sha256", key).update(value, "utf8").digest("hex");
}

function proxyAuthorization(): string {
  return `Bearer ${requiredSecret("DEVELOPER_PORTAL_UAC_PROXY_TOKEN")}`;
}

async function decode(response: Response): Promise<UacBody> {
  const text = await response.text();
  if (!text) return { ok: false, error: "uac_empty_response" };
  try {
    return JSON.parse(text) as UacBody;
  } catch {
    return { ok: false, error: "uac_invalid_response" };
  }
}

async function dispatch(path: string, payload: Record<string, unknown>): Promise<UacResult> {
  const response = await fetch(`${KASTRICK_BACKEND.replace(/\/$/, "")}/api/uac/${path}`, {
    method: "POST",
    headers: {
      authorization: proxyAuthorization(),
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return {
    status: response.status,
    body: await decode(response),
  };
}

export async function signupDeveloper(input: DeveloperCredentials): Promise<UacResult> {
  if (!input.username) throw new Error("invalid_username");
  const email = normalizeEmail(input.email);
  const username = normalizeUsername(input.username);
  const password = validatePassword(input.password);

  return dispatch("signup", {
    category: DEVELOPER_PORTAL_CATEGORY,
    serviceId: DEVELOPER_PORTAL_CATEGORY,
    emailLookup: opaqueLookup(
      "KASTRICK_UAC_EMAIL_INDEX_KEY",
      "DEVELOPER_PORTAL_UAC_EMAIL_INDEX_KEY",
      email,
    ),
    nameLookup: opaqueLookup(
      "KASTRICK_UAC_USERNAME_INDEX_KEY",
      "DEVELOPER_PORTAL_UAC_USERNAME_INDEX_KEY",
      username,
    ),
    password,
  });
}

export async function loginDeveloper(input: DeveloperCredentials): Promise<UacResult> {
  const email = normalizeEmail(input.email);
  const password = validatePassword(input.password);

  return dispatch("login", {
    category: DEVELOPER_PORTAL_CATEGORY,
    serviceId: DEVELOPER_PORTAL_CATEGORY,
    emailLookup: opaqueLookup(
      "KASTRICK_UAC_EMAIL_INDEX_KEY",
      "DEVELOPER_PORTAL_UAC_EMAIL_INDEX_KEY",
      email,
    ),
    password,
  });
}

export async function resolveDeveloperSession(sessionToken: string): Promise<UacResult> {
  if (!sessionToken) return { status: 401, body: { ok: false, error: "invalid_session" } };
  return dispatch("session", {
    sessionToken,
    serviceId: DEVELOPER_PORTAL_CATEGORY,
  });
}

export async function logoutDeveloperSession(sessionToken: string): Promise<UacResult> {
  if (!sessionToken) return { status: 200, body: { ok: true } };
  return dispatch("logout", {
    sessionToken,
    serviceId: DEVELOPER_PORTAL_CATEGORY,
  });
}

export function sessionCookieOptions(expiresAt?: number) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAge = expiresAt && expiresAt > nowSeconds
    ? Math.min(expiresAt - nowSeconds, DEFAULT_SESSION_SECONDS)
    : DEFAULT_SESSION_SECONDS;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function safeAuthBody(result: UacResult) {
  return {
    ok: result.body.ok === true,
    userId: typeof result.body.userId === "string" ? result.body.userId : undefined,
    category: DEVELOPER_PORTAL_CATEGORY,
    created: result.body.created === true,
  };
}

export function authFailureStatus(result: UacResult): number {
  if (result.status >= 400 && result.status <= 599) return result.status;
  return 400;
}

export function authError(result: UacResult): string {
  return typeof result.body.error === "string" ? result.body.error : "authentication_failed";
}

// Avoid accidentally comparing secrets with normal string equality if this helper
// is reused for future signed UAC state.
export function constantTimeTextEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
