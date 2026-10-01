import { NextRequest, NextResponse } from "next/server";
import { KASTRICK_BACKEND } from "@/lib/config";

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const target = `${KASTRICK_BACKEND.replace(/\/$/, "")}/api/rpx/package/download?package=${encodeURIComponent(name)}`;
  return NextResponse.redirect(target, 307);
}
