import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// This endpoint would be called by a cron service (Vercel Cron, external scheduler, etc.)
// In production, you would:
// 1. Use Vercel Cron or similar service to call this endpoint periodically
// 2. Check which schedules should run
// 3. Trigger video generation for due schedules

export async function GET(request: NextRequest) {
  try {
    const schedules = storage.getSchedules();
    const now = new Date();
    const dueTasks: any[] = [];

    for (const schedule of schedules) {
      if (!schedule.enabled || !schedule.nextRun) continue;

      const nextRun = new Date(schedule.nextRun);
      if (nextRun <= now) {
        dueTasks.push({
          scheduleId: schedule.id,
          time: schedule.time,
        });

        // Update last run and calculate next run
        const [hours, minutes] = schedule.time.split(':').map(Number);
        const newNextRun = new Date();
        newNextRun.setDate(newNextRun.getDate() + 1);
        newNextRun.setHours(hours, minutes, 0, 0);

        storage.updateSchedule(schedule.id, {
          lastRun: now.toISOString(),
          nextRun: newNextRun.toISOString(),
        });
      }
    }

    if (dueTasks.length > 0) {
      // In production, trigger video generation here
      // For now, just return the tasks that are due
      return NextResponse.json({
        message: `${dueTasks.length} task(s) due`,
        tasks: dueTasks,
      });
    }

    return NextResponse.json({
      message: 'No tasks due',
      tasks: [],
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Allow the endpoint to be called by Vercel Cron
export const dynamic = 'force-dynamic';
