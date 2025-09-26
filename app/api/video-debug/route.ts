import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

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

    console.log('Testing video extraction for:', videoId);

    // Test transcript extraction
    let transcriptResult = { success: false, length: 0, error: null };
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      if (transcript && transcript.length > 0) {
        const transcriptText = transcript.map(item => item.text).join(' ').trim();
        transcriptResult = { success: true, length: transcriptText.length, error: null };
      }
    } catch (error: any) {
      transcriptResult = { success: false, length: 0, error: error.message };
    }

    // Test metadata extraction
    let metadataResult = { success: false, title: '', error: null };
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          metadataResult = { 
            success: true, 
            title: titleMatch[1].replace(' - YouTube', '').trim(), 
            error: null 
          };
        }
      }
    } catch (error: any) {
      metadataResult = { success: false, title: '', error: error.message };
    }

    return NextResponse.json({
      videoId,
      transcript: transcriptResult,
      metadata: metadataResult,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: String(error) },
      { status: 500 }
    );
  }
}
