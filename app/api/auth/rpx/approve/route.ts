import { NextRequest, NextResponse } from "next/server";
import { KASTRICK_BACKEND } from "@/lib/config";
import { DEVELOPER_SESSION_COOKIE } from "@/lib/uac";

export const runtime = "nodejs";

function normalizeUserCode(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/[-\s]/g, "").toUpperCase();
  return /^[0-9A-F]{16}$/.test(normalized) ? normalized : undefined;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  try {
    const body = await response.json();
    return typeof body === "object" && body !== null
      ? body as Record<string, unknown>
      : { ok: false, error: "invalid_backend_response" };
  } catch {
    return { ok: false, error: "invalid_backend_response" };
  }
}

export async function POST(request: NextRequest) {
  const sessionToken = request.cookies.get(DEVELOPER_SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return NextResponse.json({ ok: false, error: "invalid_session" }, { status: 401 });
  }

  let payload: { userCode?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const userCode = normalizeUserCode(payload.userCode);
  if (!userCode) {
    return NextResponse.json({ ok: false, error: "invalid_user_code" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `${KASTRICK_BACKEND.replace(/\/$/, "")}/api/rpx/auth/device/approve`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionToken, userCode }),
        cache: "no-store",
      },
    );
    return NextResponse.json(await readJson(upstream), { status: upstream.status });
  } catch {
    return NextResponse.json({ ok: false, error: "rpx_auth_unavailable" }, { status: 503 });
  }
}
