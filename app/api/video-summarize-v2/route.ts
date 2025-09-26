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

    // Use a more direct approach with explicit web browsing instructions
    const systemPrompt = `You are a video content analyst with web browsing capabilities. You can access and watch YouTube videos directly through web browsing. 

    Your task is to:
    1. Browse to the provided YouTube URL
    2. Watch the video content
    3. Extract the actual video title, description, and key points
    4. Create authentic, human-like summaries and social media content

    Return JSON with this exact structure:
    {
      "title": "Actual video title from the video",
      "summary": "Detailed summary based on actual video content",
      "linkedinPost": "Professional LinkedIn post based on video content",
      "twitterThread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }`;

    const userPrompt = `Please browse to this YouTube video and watch it: ${url}

    After watching the video, provide:
    1. The actual video title
    2. A detailed summary of what the video covers
    3. A LinkedIn post that would be relevant to someone who watched this video
    4. A Twitter thread (5 tweets) that captures the key points

    Make sure your content is based on the actual video content, not generic content.`;

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
