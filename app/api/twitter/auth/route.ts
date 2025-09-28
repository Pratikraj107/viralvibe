import { NextRequest, NextResponse } from 'next/server';
import { getTwitterAuthUrl, generateCodeVerifier } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Generate state and code verifier for security
    const state = Math.random().toString(36).substring(2, 15);
    const codeVerifier = generateCodeVerifier();
    
    // Store state and code verifier in session/cookie for verification
    const response = NextResponse.redirect(getTwitterAuthUrl(state));
    
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
