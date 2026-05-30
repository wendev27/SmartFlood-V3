// GET/POST /api/relief-inventory
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ReliefInventory } from '@/types/supabase-tables';

export async function GET() {
  const { data, error } = await supabase.from<ReliefInventory>('relief_inventory').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inventory: data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from<ReliefInventory>('relief_inventory').insert([body]).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ item: data });
}
