// Twitter OAuth and API integration
export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
}

export interface TwitterPost {
  id: string;
  text: string;
  created_at: string;
}

// Twitter OAuth configuration
export const TWITTER_CONFIG = {
  clientId: process.env.TWITTER_CLIENT_ID || '',
  clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
  redirectUri: process.env.TWITTER_REDIRECT_URI || '',
  scope: 'tweet.read tweet.write users.read offline.access',
};

// Generate Twitter OAuth URL
export function getTwitterAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: TWITTER_CONFIG.clientId,
    redirect_uri: TWITTER_CONFIG.redirectUri,
    scope: TWITTER_CONFIG.scope,
    state: state,
    code_challenge: 'challenge', // For PKCE
    code_challenge_method: 'plain',
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: TWITTER_CONFIG.clientId,
      redirect_uri: TWITTER_CONFIG.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  return await response.json();
}

// Get user info from Twitter
export async function getTwitterUser(accessToken: string): Promise<TwitterUser> {
  const response = await fetch('https://api.twitter.com/2/users/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  const data = await response.json();
  return data.data;
}

// Post tweet to Twitter
export async function postTweet(accessToken: string, text: string): Promise<TwitterPost> {
  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to post tweet: ${error.detail || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.data;
}

// Generate PKCE code verifier
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
