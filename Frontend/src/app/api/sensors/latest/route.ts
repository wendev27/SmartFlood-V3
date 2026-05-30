// GET /api/sensors/latest
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoClient';

export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const sensors = await db.collection('sensors').find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    return NextResponse.json({ sensors });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
