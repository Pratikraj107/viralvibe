import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    if (!youtubeRegex.test(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid YouTube URL' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    console.log('Processing video with ID:', videoId);

    // First, extract actual video metadata using web scraping
    let videoTitle = 'Video Title';
    let videoDescription = 'Video description not available';
    let channelName = 'Channel';

    try {
      console.log('Fetching video metadata...');
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
          videoTitle = titleMatch[1].replace(' - YouTube', '').trim();
        }
        
        // Extract description
        const descMatch = html.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
          videoDescription = descMatch[1];
        }
        
        // Extract channel name
        const channelMatch = html.match(/"ownerText":\{"runs":\[\{"text":"([^"]+)"/);
        if (channelMatch) {
          channelName = channelMatch[1];
        }
        
        console.log('Extracted metadata:', { videoTitle, channelName, descriptionLength: videoDescription.length });
      }
    } catch (error) {
      console.error('Failed to fetch video metadata:', error);
    }

    // If we couldn't get good metadata, try using Serper API as fallback
    if (videoTitle === 'Video Title' || videoDescription === 'Video description not available') {
      try {
        const serperKey = process.env.SERPER_API_KEY;
        if (serperKey) {
          console.log('Using Serper API as fallback...');
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
            if (result.title) videoTitle = result.title;
            if (result.snippet) videoDescription = result.snippet;
            console.log('Serper fallback successful:', { videoTitle, descriptionLength: videoDescription.length });
          }
        }
      } catch (serperError) {
        console.error('Serper fallback failed:', serperError);
      }
    }

    // Use the extracted metadata to create a more targeted prompt
    const systemPrompt = `You are a video content analyst. You will be given specific video information and need to create authentic, human-like summaries and social media content based on that information.

    Return JSON with this exact structure:
    {
      "title": "Video title",
      "summary": "Detailed summary based on the provided video information",
      "linkedinPost": "Professional LinkedIn post based on video content",
      "twitterThread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }`;

    const userPrompt = `Analyze this YouTube video based on the following information:

    Video Title: ${videoTitle}
    Channel: ${channelName}
    Description: ${videoDescription}
    URL: ${url}

    Create a detailed summary and social media content that accurately reflects what this specific video is about. Base your content on the actual video title and description provided above.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate video summary' },
        { status: 500 }
      );
    }

    const parsedContent = JSON.parse(content);
    
    // Validate the response structure
    if (!parsedContent.title || !parsedContent.summary || !parsedContent.linkedinPost || !Array.isArray(parsedContent.twitterThread)) {
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      title: parsedContent.title,
      summary: parsedContent.summary,
      linkedinPost: parsedContent.linkedinPost,
      twitterThread: parsedContent.twitterThread,
      originalUrl: url
    });

  } catch (error) {
    console.error('Video summarizer V2 error:', error);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: 'Internal server error', details: isProd ? undefined : String((error as any)?.message || error) },
      { status: 500 }
    );
  }
}
