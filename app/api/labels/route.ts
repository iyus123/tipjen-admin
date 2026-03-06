import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function GET() {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("labels")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = getServiceSupabase();
  const body = await req.json();

  const { data, error } = await supabase
    .from("labels")
    .insert({ name: body.name })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
