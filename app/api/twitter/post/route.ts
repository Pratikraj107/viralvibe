import { NextRequest, NextResponse } from 'next/server';
import { postTweet } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Tweet text is required' },
        { status: 400 }
      );
    }

    // Get access token from cookies
    const accessToken = request.cookies.get('twitter_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Twitter' },
        { status: 401 }
      );
    }

    // Validate tweet length
    if (text.length > 280) {
      return NextResponse.json(
        { error: 'Tweet is too long (max 280 characters)' },
        { status: 400 }
      );
    }

    // Post tweet
    const tweet = await postTweet(accessToken, text);

    return NextResponse.json({
      success: true,
      tweet: {
        id: tweet.id,
        text: tweet.text,
        url: `https://twitter.com/i/status/${tweet.id}`,
      },
    });
  } catch (error: any) {
    console.error('Twitter post error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post tweet', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
