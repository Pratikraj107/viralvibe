# Environment Variables Setup Guide

## Required Environment Variables

Add these to your deployment platform (Netlify/Vercel):

### Core API Keys
```
OPENAI_API_KEY=sk-your-openai-key-here
SERPER_API_KEY=your-serper-key-here
YOUTUBE_API_KEY=your-youtube-api-key-here
```

### Authentication
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Twitter Integration (NEW)
```
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_REDIRECT_URI=https://your-domain.com/api/twitter/callback
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Twitter API Setup

### 1. Create Twitter Developer Account
- Go to [Twitter Developer Portal](https://developer.twitter.com/)
- Apply for developer account
- Create new project/app

### 2. Configure OAuth 2.0
- Enable OAuth 2.0 in app settings
- Set redirect URI: `https://your-domain.com/api/twitter/callback`
- Add website URL: `https://your-domain.com`

### 3. Get API Keys
- Copy Client ID and Client Secret
- Set app permissions to "Read and write"

## Features Added

✅ **Direct Twitter Posting** - Post tweets directly from the app
✅ **OAuth Authentication** - Secure Twitter login
✅ **Post Status Tracking** - Success/failure notifications
✅ **Tweet Links** - Direct links to posted tweets
✅ **User Profile Display** - Show connected Twitter account

## Security Features

- PKCE (Proof Key for Code Exchange) for OAuth
- State parameter for CSRF protection
- Secure cookie storage
- Token expiration handling

## Testing

1. Generate content in the app
2. Click "Post to X" button
3. Authenticate with Twitter
4. Tweet is posted directly
5. Get success notification with tweet link
