import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('youtube_access_token')?.value;
    const refreshToken = cookieStore.get('youtube_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ authenticated: false });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      const response = await youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true,
      });

      const channel = response.data.items?.[0];

      return NextResponse.json({
        authenticated: true,
        channel: {
          id: channel?.id,
          title: channel?.snippet?.title,
          thumbnail: channel?.snippet?.thumbnails?.default?.url,
          subscriberCount: channel?.statistics?.subscriberCount,
        },
      });
    } catch (error) {
      // Token might be expired, try to refresh
      if (refreshToken) {
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          cookieStore.set('youtube_access_token', credentials.access_token || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
          });

          return NextResponse.json({ authenticated: true });
        } catch (refreshError) {
          return NextResponse.json({ authenticated: false });
        }
      }

      return NextResponse.json({ authenticated: false });
    }
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
