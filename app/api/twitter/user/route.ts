import { NextRequest, NextResponse } from 'next/server';
import { getTwitterUser } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookies
    const accessToken = request.cookies.get('twitter_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with Twitter' },
        { status: 401 }
      );
    }

    // Get user info
    const user = await getTwitterUser(accessToken);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Twitter user info error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user info', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
