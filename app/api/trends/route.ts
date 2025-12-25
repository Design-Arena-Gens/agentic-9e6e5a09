import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const trends = storage.getTrends();
    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Get trends error:', error);
    return NextResponse.json({ error: 'Failed to get trends' }, { status: 500 });
  }
}
