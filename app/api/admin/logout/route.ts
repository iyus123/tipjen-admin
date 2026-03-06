import { NextResponse } from "next/server";
import { clearLoginCookie } from "@/lib/auth";

export async function POST() {
  clearLoginCookie();
  return NextResponse.json({ ok: true });
}
