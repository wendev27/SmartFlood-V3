// GET/POST /api/families
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Family } from '@/types/supabase-tables';

export async function GET() {
  const { data, error } = await supabase.from<Family>('families').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ families: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from<Family>('families').insert([body]).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ family: data });
}
