import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceSupabase();

    const { data: current, error: findError } = await supabase
      .from("products")
      .select("id, is_published")
      .eq("id", params.id)
      .single();

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("products")
      .update({ is_published: !current.is_published })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
