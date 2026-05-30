// GET/POST /api/residents
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Resident } from '@/types/supabase-tables';

export async function GET() {
  const { data, error } = await supabase.from<Resident>('residents').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ residents: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from<Resident>('residents').insert([body]).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ resident: data });
}
