import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN) {
    return NextResponse.json({ message: "ADMIN_PASSWORD atau ADMIN_SESSION_TOKEN belum diatur." }, { status: 500 });
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ message: "Password salah." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: getAdminCookieName(),
    value: process.env.ADMIN_SESSION_TOKEN,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
