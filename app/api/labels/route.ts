import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const { name } = await req.json();
  const value = String(name || "").trim();
  if (!value) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("product_labels").upsert({ name: value }, { onConflict: "name" }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
