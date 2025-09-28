import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getTwitterUser } from '@/lib/twitter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?error=twitter_auth_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?error=twitter_auth_invalid`);
    }

    // Verify state parameter
    const storedState = request.cookies.get('twitter_oauth_state')?.value;
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;

    if (!storedState || !codeVerifier || state !== storedState) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?error=twitter_auth_invalid_state`);
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, codeVerifier);
    const user = await getTwitterUser(tokenData.access_token);

    // Store tokens securely (in production, use a secure session store)
    const response = NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?twitter_auth=success`);
    
    // Set secure cookies with tokens
    response.cookies.set('twitter_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in || 7200, // 2 hours default
    });
    
    response.cookies.set('twitter_refresh_token', tokenData.refresh_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    response.cookies.set('twitter_user', JSON.stringify(user), {
      httpOnly: false, // Need to access from client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear OAuth state cookies
    response.cookies.delete('twitter_oauth_state');
    response.cookies.delete('twitter_code_verifier');

    return response;
  } catch (error) {
    console.error('Twitter OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app?error=twitter_auth_failed`);
  }
}
