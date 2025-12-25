import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import OpenAI from 'openai';

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Return default trends if no API key
      const trends = storage.getTrends();
      return NextResponse.json({ trends });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a YouTube trends analyzer. Generate 5 current trending video topics with categories and keywords.',
        },
        {
          role: 'user',
          content:
            'Give me 5 trending YouTube video topics right now. Format as JSON array with fields: title, category, keywords (array of 4-5 strings).',
        },
      ],
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const data = JSON.parse(response);
    const trends = data.trends || data.topics || Object.values(data)[0];

    if (Array.isArray(trends) && trends.length > 0) {
      storage.setTrends(trends);
      return NextResponse.json({ trends });
    }

    // Fallback to existing trends
    const existingTrends = storage.getTrends();
    return NextResponse.json({ trends: existingTrends });
  } catch (error) {
    console.error('Refresh trends error:', error);
    const trends = storage.getTrends();
    return NextResponse.json({ trends });
  }
}
