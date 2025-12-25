import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const schedules = storage.getSchedules();
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    return NextResponse.json({ error: 'Failed to get schedules' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { time } = body;

    if (!time) {
      return NextResponse.json({ error: 'Time is required' }, { status: 400 });
    }

    const schedule = storage.addSchedule(time);
    const schedules = storage.getSchedules();

    return NextResponse.json({ schedules, schedule });
  } catch (error) {
    console.error('Add schedule error:', error);
    return NextResponse.json({ error: 'Failed to add schedule' }, { status: 500 });
  }
}
