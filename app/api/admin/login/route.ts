import { NextResponse } from "next/server";
import { setLoginCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = String(body.password || "");
  const adminPassword = process.env.ADMIN_PASSWORD || "tipjen123";

  if (password !== adminPassword) {
    return NextResponse.json({ message: "Password salah." }, { status: 401 });
  }

  setLoginCookie();
  return NextResponse.json({ ok: true });
}
