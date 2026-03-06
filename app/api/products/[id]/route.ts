import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
