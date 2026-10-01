import { NextRequest, NextResponse } from "next/server";
import { developerBackendRequest, relayDeveloperResponse } from "@/lib/developer-api";

export const runtime = "nodejs";

function deploymentsPath(request: NextRequest): string {
  const query = new URLSearchParams();
  const packageName = request.nextUrl.searchParams.get("package");
  const deployId = request.nextUrl.searchParams.get("deployid");
  if (packageName) query.set("package", packageName);
  if (deployId) query.set("deployid", deployId);
  const suffix = query.toString();
  return `/api/rpx/developer/deployments${suffix ? `?${suffix}` : ""}`;
}

export async function GET(request: NextRequest) {
  return relayDeveloperResponse(await developerBackendRequest(request, deploymentsPath(request), {
    method: "GET",
  }));
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  return relayDeveloperResponse(await developerBackendRequest(request, "/api/rpx/developer/deployments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }));
}
