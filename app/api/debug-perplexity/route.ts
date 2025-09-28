import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!perplexityApiKey) {
      return NextResponse.json({
        error: 'PERPLEXITY_API_KEY not found in environment variables',
        hasApiKey: false,
        environment: process.env.NODE_ENV
      });
    }

    // Test the Perplexity API with a simple query
    const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a trending topics analyst that provides current, real-time trending topics.'
          },
          {
            role: 'user',
            content: 'What are 3 trending tech topics today? Return as JSON array with title and summary.'
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return NextResponse.json({
        error: `Perplexity API error: ${testResponse.status}`,
        details: errorText,
        hasApiKey: true,
        apiKeyPrefix: perplexityApiKey.substring(0, 10) + '...'
      });
    }

    const testData = await testResponse.json();
    
    return NextResponse.json({
      success: true,
      hasApiKey: true,
      apiKeyPrefix: perplexityApiKey.substring(0, 10) + '...',
      response: testData,
      environment: process.env.NODE_ENV
    });

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to test Perplexity API',
      details: error.message,
      hasApiKey: !!process.env.PERPLEXITY_API_KEY,
      environment: process.env.NODE_ENV
    });
  }
}
