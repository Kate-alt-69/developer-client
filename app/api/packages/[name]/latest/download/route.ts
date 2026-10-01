import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const base = process.env.RBE_API_BASE?.replace(/\/$/, "");
  if (!base) {
    return NextResponse.json({ error: "RBE_API_BASE is not configured yet", package: name, version: "latest" }, { status: 503 });
  }
  const target = `${base}/api/rpx/package/download?package=${encodeURIComponent(name)}`;
  return NextResponse.redirect(target, 307);
}
