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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Extract content from URL using OpenAI's web browsing capability
    const systemPrompt = `You're a skilled content analyst who reads articles and creates natural, human-like summaries and social media content. Write as if you're a knowledgeable person sharing insights, not an AI. Use conversational tone, personal opinions, and authentic language. Avoid corporate speak or obvious AI patterns.
    
    Return JSON with this structure:
    {
      "title": "Article title",
      "summary": "Natural, conversational summary that sounds like a real person explaining the article",
      "linkedinPost": "Professional but human LinkedIn post that sounds genuine",
      "twitterThread": ["Tweet 1", "Tweet 2", "Tweet 3", "Tweet 4", "Tweet 5"]
    }`;

    const userPrompt = `Read and analyze this article: ${url}
    
    Create a natural summary and social media content that sounds like it's written by a real person who actually read and understood the article.`;

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
        { error: 'Failed to generate summary' },
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
    console.error('Summarize API error:', error);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { 
        error: 'Failed to summarize content', 
        details: isProd ? undefined : String((error as any)?.message || error) 
      },
      { status: 500 }
    );
  }
}
