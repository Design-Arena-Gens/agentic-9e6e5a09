import OpenAI from 'openai';
import Replicate from 'replicate';
import axios from 'axios';
import { storage } from './storage';

export interface VideoGenerationResult {
  videoUrl: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
}

export class VideoGenerator {
  private openai: OpenAI | null = null;
  private replicate: Replicate | null = null;

  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    if (process.env.REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
    }
  }

  async generateVideo(logs: string[] = []): Promise<VideoGenerationResult> {
    logs.push('Starting video generation...');

    // Step 1: Get trending topics
    const trends = storage.getTrends();
    const randomTrend = trends[Math.floor(Math.random() * trends.length)];
    logs.push(`Selected trend: ${randomTrend.title}`);

    // Step 2: Generate video content idea
    logs.push('Generating video content with AI...');
    const contentIdea = await this.generateContentIdea(randomTrend);
    logs.push(`Content idea: ${contentIdea.title}`);

    // Step 3: Generate video (mock for demo - in production use real video generation)
    logs.push('Generating video content...');
    const videoUrl = await this.createVideo(contentIdea, logs);
    logs.push('Video generated successfully!');

    return {
      videoUrl,
      title: contentIdea.title,
      description: contentIdea.description,
      tags: contentIdea.tags,
    };
  }

  private async generateContentIdea(trend: any): Promise<any> {
    if (!this.openai) {
      // Mock content if no OpenAI key
      return {
        title: `${trend.title} - What You Need to Know!`,
        description: `Exploring the latest trends in ${trend.category}. In this video, we dive deep into ${trend.title} and share insights you won't want to miss!`,
        tags: trend.keywords,
        script: `Welcome back! Today we're talking about ${trend.title}...`,
      };
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a YouTube content creator. Create engaging video ideas based on trends.',
        },
        {
          role: 'user',
          content: `Create a YouTube video idea based on this trend: ${trend.title} (Category: ${trend.category}). Include: title (max 70 chars), description (2-3 sentences), tags (8-10 relevant keywords), and a brief 30-second script. Format as JSON.`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('Failed to generate content idea');
    }

    return JSON.parse(response);
  }

  private async createVideo(contentIdea: any, logs: string[]): Promise<string> {
    // For demo purposes, we'll create a simple video URL
    // In production, you would:
    // 1. Use text-to-speech for narration
    // 2. Generate images with DALL-E or Stable Diffusion
    // 3. Use video generation API (Runway, Synthesia, etc.)
    // 4. Combine with ffmpeg or similar tool

    if (this.replicate) {
      try {
        logs.push('Using AI to generate video scenes...');

        // Generate a thumbnail/image for the video
        const output: any = await this.replicate.run(
          'stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
          {
            input: {
              prompt: `YouTube thumbnail: ${contentIdea.title}, professional, eye-catching, high quality`,
              negative_prompt: 'text, watermark, blurry, low quality',
            },
          }
        );

        if (output && output[0]) {
          logs.push('AI-generated thumbnail created!');
          return output[0]; // Return the generated image URL
        }
      } catch (error) {
        logs.push('Using placeholder video (AI generation unavailable)');
      }
    }

    // Fallback: return a placeholder video URL
    // In a real implementation, this would be a generated video file
    return `https://example.com/videos/demo-${Date.now()}.mp4`;
  }

  async downloadVideo(url: string): Promise<Buffer> {
    // Download the video file
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }
}

export const videoGenerator = new VideoGenerator();
