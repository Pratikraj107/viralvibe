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

    console.log('Testing video metadata extraction for:', videoId);

    // Test direct web scraping
    let scrapingResult = { success: false, title: '', description: '', channel: '', error: null };
    try {
      const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // Extract title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          scrapingResult.title = titleMatch[1].replace(' - YouTube', '').trim();
        }
        
        // Extract description
        const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
          scrapingResult.description = descMatch[1];
        }
        
        // Extract channel name
        const channelMatch = html.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);
        if (channelMatch) {
          scrapingResult.channel = channelMatch[1];
        }
        
        scrapingResult.success = true;
      }
    } catch (error: any) {
      scrapingResult.error = error.message;
    }

    // Test Serper API fallback
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
            q: `site:youtube.com ${videoId}`,
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
      scraping: scrapingResult,
      serper: serperResult,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Video test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}
