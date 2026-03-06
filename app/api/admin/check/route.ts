import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ loggedIn: isLoggedIn() });
}
