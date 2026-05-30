// GET/POST /api/applications
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Application } from '@/types/supabase-tables';

export async function GET() {
  const { data, error } = await supabase.from<Application>('applications').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from<Application>('applications').insert([body]).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ application: data });
}
