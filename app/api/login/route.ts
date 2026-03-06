import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== env.adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  cookies().set("tipjen_admin_session", env.adminPassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ ok: true });
}
