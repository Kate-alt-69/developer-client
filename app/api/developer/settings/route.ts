import { NextRequest, NextResponse } from "next/server";
import { developerBackendRequest, relayDeveloperResponse } from "@/lib/developer-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const packageName = request.nextUrl.searchParams.get("package")?.trim();
  if (!packageName) {
    return NextResponse.json({ ok: false, error: "package_required" }, { status: 400 });
  }
  const path = `/api/rpx/developer/settings?package=${encodeURIComponent(packageName)}`;
  return relayDeveloperResponse(await developerBackendRequest(request, path, { method: "GET" }));
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }
  return relayDeveloperResponse(await developerBackendRequest(request, "/api/rpx/developer/settings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
}
