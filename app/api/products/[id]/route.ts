import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import type { ProductPayload } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = (await request.json()) as ProductPayload;
  const payload = {
    ...body,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };

  const { data, error } = await supabaseServer
    .from('products')
    .update(payload)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseServer.from('products').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
