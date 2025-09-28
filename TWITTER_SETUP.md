# Twitter API Setup Guide

## Required Environment Variables

Add these environment variables to your deployment platform (Netlify/Vercel):

### 1. Twitter API Keys
```
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_REDIRECT_URI=https://your-domain.com/api/twitter/callback
```

### 2. App URL (for OAuth redirects)
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## How to Get Twitter API Keys

### Step 1: Create Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for a developer account
3. Create a new project/app

### Step 2: Configure OAuth 2.0
1. In your Twitter app settings, go to "Authentication settings"
2. Enable OAuth 2.0
3. Set redirect URI to: `https://your-domain.com/api/twitter/callback`
4. Add website URL: `https://your-domain.com`

### Step 3: Get API Keys
1. Go to "Keys and tokens" tab
2. Copy your **Client ID** and **Client Secret**
3. Add them to your environment variables

### Step 4: Configure Permissions
1. In "App permissions", select "Read and write"
2. This allows the app to post tweets on behalf of users

## Features Included

✅ **OAuth 2.0 Authentication** - Secure Twitter login
✅ **Direct Posting** - Post tweets directly from the app
✅ **User Profile** - Display connected Twitter account
✅ **Post Status** - Show success/failure of posts
✅ **Tweet Links** - Direct links to posted tweets

## Security Features

- **PKCE (Proof Key for Code Exchange)** for secure OAuth
- **State parameter** to prevent CSRF attacks
- **Secure cookies** for token storage
- **Token expiration** handling

## Testing

1. **Local Development**: Use `http://localhost:3000` as redirect URI
2. **Production**: Use your actual domain as redirect URI
3. **Test Flow**: Generate content → Click "Post to X" → Authenticate → Post tweet

## Troubleshooting

- **OAuth Error**: Check redirect URI matches exactly
- **Post Failed**: Verify app has "Read and write" permissions
- **Token Expired**: User needs to re-authenticate
- **Rate Limits**: Twitter has posting rate limits (300 tweets per 15 minutes)
