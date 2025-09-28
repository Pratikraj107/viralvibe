import { NextRequest, NextResponse } from 'next/server';
import { getTwitterAuthUrl, generateCodeVerifier } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET || !process.env.TWITTER_REDIRECT_URI) {
      console.error('Missing Twitter environment variables');
      return NextResponse.json(
        { error: 'Twitter OAuth not configured. Missing environment variables.' },
        { status: 500 }
      );
    }

    // Generate state and code verifier for security
    const state = Math.random().toString(36).substring(2, 15);
    const codeVerifier = generateCodeVerifier();
    
    console.log('Twitter OAuth initiated:', {
      clientId: process.env.TWITTER_CLIENT_ID?.substring(0, 8) + '...',
      redirectUri: process.env.TWITTER_REDIRECT_URI,
      state: state.substring(0, 8) + '...'
    });
    
    // Store state and code verifier in session/cookie for verification
    const response = NextResponse.redirect(getTwitterAuthUrl(state, codeVerifier));
    
    // Set cookies for state verification
    response.cookies.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });
    
    return response;
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth' },
      { status: 500 }
    );
  }
}
