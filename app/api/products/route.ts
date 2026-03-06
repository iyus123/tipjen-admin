import { NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase";
import { isLoggedIn } from "@/lib/auth";

function unauthorized() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  if (!isLoggedIn()) return unauthorized();

  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  if (!isLoggedIn()) return unauthorized();

  const body = await request.json();
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("products").insert({
    name: body.name,
    category: body.category,
    price: body.price,
    stock: body.stock,
    image_url: body.image_url,
    description: body.description,
    is_published: body.is_published,
  }).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function PUT(request: Request) {
  if (!isLoggedIn()) return unauthorized();

  const body = await request.json();
  const supabase = getAdminSupabase();
  const { data, error } = await supabase.from("products").update({
    name: body.name,
    category: body.category,
    price: body.price,
    stock: body.stock,
    image_url: body.image_url,
    description: body.description,
    is_published: body.is_published,
    updated_at: new Date().toISOString(),
  }).eq("id", body.id).select().single();

  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}

export async function DELETE(request: Request) {
  if (!isLoggedIn()) return unauthorized();
  const body = await request.json();
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("products").delete().eq("id", body.id);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
