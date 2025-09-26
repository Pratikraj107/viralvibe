import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    console.log('Testing YouTube Data API for video:', videoId);

    // Test YouTube Data API
    let youtubeResult = { success: false, title: '', description: '', channel: '', error: null };
    try {
      const youtubeApiKey = process.env.YOUTUBE_API_KEY;
      if (!youtubeApiKey) {
        youtubeResult.error = 'YOUTUBE_API_KEY not set';
      } else {
        const youtubeResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${youtubeApiKey}`
        );
        
        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();
          if (youtubeData.items && youtubeData.items.length > 0) {
            const video = youtubeData.items[0];
            youtubeResult.title = video.snippet.title || '';
            youtubeResult.description = video.snippet.description || '';
            youtubeResult.channel = video.snippet.channelTitle || '';
            youtubeResult.success = true;
          } else {
            youtubeResult.error = 'Video not found';
          }
        } else {
          youtubeResult.error = `API Error: ${youtubeResponse.status}`;
        }
      }
    } catch (error: any) {
      youtubeResult.error = error.message;
    }

    // Test Serper API as fallback
    let serperResult = { success: false, title: '', description: '', error: null };
    try {
      const serperKey = process.env.SERPER_API_KEY;
      if (serperKey) {
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': serperKey,
          },
          body: JSON.stringify({
            q: `"${videoId}" site:youtube.com`,
            num: 1
          })
        });
        
        const serperData = await serperResponse.json();
        if (serperData.organic && serperData.organic.length > 0) {
          const result = serperData.organic[0];
          serperResult.title = result.title || '';
          serperResult.description = result.snippet || '';
          serperResult.success = true;
        }
      }
    } catch (error: any) {
      serperResult.error = error.message;
    }

    return NextResponse.json({
      videoId,
      url,
      youtube: youtubeResult,
      serper: serperResult,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('YouTube test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}
