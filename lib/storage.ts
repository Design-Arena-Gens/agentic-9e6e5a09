// Simple in-memory storage for demo purposes
// In production, use a database like PostgreSQL, MongoDB, or Redis

interface Schedule {
  id: string;
  time: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

interface VideoTrend {
  title: string;
  category: string;
  keywords: string[];
}

class Storage {
  private schedules: Schedule[] = [];
  private trends: VideoTrend[] = [
    {
      title: 'AI Technology Breakthroughs',
      category: 'Technology',
      keywords: ['AI', 'machine learning', 'technology', 'innovation'],
    },
    {
      title: 'Productivity Hacks 2025',
      category: 'Lifestyle',
      keywords: ['productivity', 'tips', 'life hacks', 'efficiency'],
    },
    {
      title: 'Cryptocurrency Market Analysis',
      category: 'Finance',
      keywords: ['crypto', 'bitcoin', 'blockchain', 'trading'],
    },
    {
      title: 'Fitness & Wellness Trends',
      category: 'Health',
      keywords: ['fitness', 'health', 'wellness', 'exercise'],
    },
    {
      title: 'Gaming Industry Updates',
      category: 'Gaming',
      keywords: ['gaming', 'esports', 'video games', 'entertainment'],
    },
  ];

  getSchedules(): Schedule[] {
    return this.schedules;
  }

  addSchedule(time: string): Schedule {
    const schedule: Schedule = {
      id: Date.now().toString(),
      time,
      enabled: true,
      nextRun: this.calculateNextRun(time),
    };
    this.schedules.push(schedule);
    return schedule;
  }

  updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
    const index = this.schedules.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.schedules[index] = { ...this.schedules[index], ...updates };

    if (updates.enabled !== undefined) {
      this.schedules[index].nextRun = updates.enabled
        ? this.calculateNextRun(this.schedules[index].time)
        : undefined;
    }

    return this.schedules[index];
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex((s) => s.id === id);
    if (index === -1) return false;

    this.schedules.splice(index, 1);
    return true;
  }

  getTrends(): VideoTrend[] {
    return this.trends;
  }

  setTrends(trends: VideoTrend[]): void {
    this.trends = trends;
  }

  private calculateNextRun(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const nextRun = new Date();

    nextRun.setHours(hours, minutes, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    return nextRun.toISOString();
  }
}

export const storage = new Storage();
