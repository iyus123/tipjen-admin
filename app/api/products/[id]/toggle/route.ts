import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceSupabase();
  const { data: current, error: fetchError } = await supabase.from("products").select("id,is_published").eq("id", params.id).single();
  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });
  const { data, error } = await supabase.from("products").update({ is_published: !current.is_published }).eq("id", params.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
