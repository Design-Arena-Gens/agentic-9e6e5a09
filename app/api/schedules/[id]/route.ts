import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const schedule = storage.updateSchedule(id, body);

    if (!schedule) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const schedules = storage.getSchedules();
    return NextResponse.json({ schedules, schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    return NextResponse.json({ error: 'Failed to update schedule' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = storage.deleteSchedule(id);

    if (!success) {
      return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    }

    const schedules = storage.getSchedules();
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json({ error: 'Failed to delete schedule' }, { status: 500 });
  }
}
