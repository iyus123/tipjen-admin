import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import type { ProductPayload } from '@/lib/types';

export async function GET() {
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const body = (await request.json()) as ProductPayload;
  const payload = {
    ...body,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  const { data, error } = await supabaseServer
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
