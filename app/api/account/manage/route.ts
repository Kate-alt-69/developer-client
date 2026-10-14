import { NextResponse } from "next/server";
import { loginConfig } from "@/lib/kastrick-login";
export function GET() {
	try { return NextResponse.redirect(new URL("/account", loginConfig().authority)); }
	catch { return NextResponse.json({ ok: false, message: "Kastrick Account management is temporarily unavailable." }, { status: 503 }); }
}
