import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { videoGenerator } from '@/lib/video-generator';
import { youtubeUploader } from '@/lib/youtube-uploader';

export async function POST(request: NextRequest) {
  const logs: string[] = [];

  try {
    logs.push('Starting video generation process...');

    // Get authentication tokens
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('youtube_access_token')?.value;
    const refreshToken = cookieStore.get('youtube_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated', logs },
        { status: 401 }
      );
    }

    // Generate video
    const videoData = await videoGenerator.generateVideo(logs);

    // Upload to YouTube
    logs.push('Preparing to upload to YouTube...');
    const youtubeUrl = await youtubeUploader.uploadVideo(
      accessToken,
      refreshToken || '',
      videoData,
      logs
    );

    logs.push(`Success! Video available at: ${youtubeUrl}`);

    return NextResponse.json({
      success: true,
      videoUrl: youtubeUrl,
      logs,
    });
  } catch (error: any) {
    console.error('Generate video error:', error);
    logs.push(`Error: ${error.message}`);

    return NextResponse.json(
      {
        error: error.message || 'Failed to generate video',
        logs,
      },
      { status: 500 }
    );
  }
}

// Increase timeout for video generation
export const maxDuration = 300; // 5 minutes
