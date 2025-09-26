import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';

export const dynamic = 'force-dynamic';

// Function to extract video transcript using youtube-transcript library
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    console.log('Attempting to fetch transcript for video:', videoId);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (transcript && transcript.length > 0) {
      const transcriptText = transcript.map(item => item.text).join(' ').trim();
      console.log('Transcript fetched successfully, length:', transcriptText.length);
      return transcriptText;
    }
  } catch (error: any) {
    console.error('Failed to get transcript:', error);
    console.error('Transcript error details:', {
      message: error?.message,
      code: error?.code,
      status: error?.status
    });
  }
  
  return '';
}

// Function to get video metadata by scraping YouTube page
async function getVideoMetadata(videoId: string): Promise<{title: string, description: string, channelTitle: string}> {
  try {
    console.log('Attempting to fetch metadata for video:', videoId);
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('Metadata fetch response status:', response.status);
    
    if (response.ok) {
      const html = await response.text();
      
      // Extract title from HTML - try multiple patterns
      let title = 'Video Title';
      const titleMatch1 = html.match(/<title>([^<]+)<\/title>/);
      const titleMatch2 = html.match(/"title":"([^"]+)"/);
      const titleMatch3 = html.match(/<meta property="og:title" content="([^"]+)"/);
      
      if (titleMatch1) {
        title = titleMatch1[1].replace(' - YouTube', '').trim();
      } else if (titleMatch2) {
        title = titleMatch2[1];
      } else if (titleMatch3) {
        title = titleMatch3[1];
      }
      
      // Extract description from meta tags
      let description = 'Video description not available';
      const descMatch1 = html.match(/<meta name="description" content="([^"]+)"/);
      const descMatch2 = html.match(/<meta property="og:description" content="([^"]+)"/);
      
      if (descMatch1) {
        description = descMatch1[1];
      } else if (descMatch2) {
        description = descMatch2[1];
      }
      
      // Extract channel name - try multiple patterns
      let channelTitle = 'Channel';
      const channelMatch1 = html.match(/"ownerText":\{"runs":\[{"text":"([^"]+)"/);
      const channelMatch2 = html.match(/"channelName":"([^"]+)"/);
      const channelMatch3 = html.match(/<meta property="og:video:author" content="([^"]+)"/);
      
      if (channelMatch1) {
        channelTitle = channelMatch1[1];
      } else if (channelMatch2) {
        channelTitle = channelMatch2[1];
      } else if (channelMatch3) {
        channelTitle = channelMatch3[1];
      }
      
      return {
        title,
        description,
        channelTitle
      };
    }
  } catch (error: any) {
    console.warn('Failed to get video metadata:', error);
  }
  
  return {
    title: 'Video Title',
    description: 'Video description not available',
    channelTitle: 'Channel'
  };
}

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
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Could not extract video ID from URL' },
        { status: 400 }
      );
    }

    // Create system prompt for video analysis
    const systemPrompt = `You're a skilled video analyst who watches YouTube videos and creates natural, human-like summaries and social media content. You have the ability to browse the web and watch YouTube videos directly. Write as if you're a knowledgeable person sharing insights about a video you just watched, not an AI. Use conversational tone, personal opinions, and authentic language. Avoid corporate speak or obvious AI patterns.

    IMPORTANT: You must actually watch the video by browsing to the URL provided. Do not generate generic content - base your response on the actual video content you observe.

    Return JSON with this structure:
    {
      "title": "Actual video title from the video",
      "summary": "Natural, conversational summary that sounds like a real person explaining what they learned from the video",
      "linkedinPost": "Professional but human LinkedIn post that sounds genuine and engaging",
      "twitterThread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }`;

    // Extract video content
    const [transcript, metadata] = await Promise.all([
      getVideoTranscript(videoId),
      getVideoMetadata(videoId)
    ]);

    console.log('Video extraction results:', {
      videoId,
      title: metadata.title,
      channel: metadata.channelTitle,
      transcriptLength: transcript?.length || 0,
      hasTranscript: !!transcript
    });

    // If no transcript is available, provide a more detailed prompt
    const hasTranscript = transcript && transcript.length > 50;
    
    let userPrompt: string;
    
    if (hasTranscript) {
      // Use transcript if available
      userPrompt = `Analyze this YouTube video:
      Title: ${metadata.title}
      Channel: ${metadata.channelTitle}
      Description: ${metadata.description}
      Transcript: ${transcript}
      
      Create a natural summary and social media content that sounds like it's written by a real person who actually watched and understood the video. Make the content engaging and authentic.`;
    } else {
      // Fallback: Use OpenAI's web browsing capability
      console.log('No transcript available, using OpenAI web browsing fallback');
      userPrompt = `Please browse to and watch this YouTube video: ${url}
      
      After watching the video, create a natural summary and social media content that sounds like it's written by a real person who actually watched and understood the video. Make the content engaging and authentic.
      
      IMPORTANT: You must actually browse to the URL and watch the video content. Do not generate generic content - base your response on what you actually observe in the video.`;
    }

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
      title: metadata.title || parsedContent.title,
      summary: parsedContent.summary,
      linkedinPost: parsedContent.linkedinPost,
      twitterThread: parsedContent.twitterThread,
      originalUrl: url
    });

  } catch (error) {
    console.error('Video summarize API error:', error);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { 
        error: 'Failed to summarize video', 
        details: isProd ? undefined : String((error as any)?.message || error) 
      },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}
