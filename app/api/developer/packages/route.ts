import { NextRequest } from "next/server";
import { developerBackendRequest, relayDeveloperResponse } from "@/lib/developer-api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const result = await developerBackendRequest(request, "/api/rpx/developer/packages", {
    method: "GET",
  });
  return relayDeveloperResponse(result);
}
