# Perplexity API Setup Guide

This guide will help you set up the Perplexity API for generating trending topics and articles.

## 1. Get Perplexity API Key

1. Go to [Perplexity API Console](https://www.perplexity.ai/settings/api)
2. Sign up or log in to your Perplexity account
3. Navigate to the API section
4. Create a new API key
5. Copy the API key (it starts with `pplx-`)

## 2. Add to Environment Variables

Add your Perplexity API key to your `.env.local` file:

```bash
# Perplexity API
PERPLEXITY_API_KEY=pplx-your-api-key-here
```

## 3. Deploy Environment Variables

### For Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `PERPLEXITY_API_KEY` with your API key
5. Redeploy your application

### For Netlify:
1. Go to your Netlify dashboard
2. Select your site
3. Go to Site settings → Environment variables
4. Add `PERPLEXITY_API_KEY` with your API key
5. Redeploy your site

## 4. API Features

The Perplexity API integration provides:

- **Real-time web access**: Gets current trending topics and news
- **Country-specific results**: Tailored to your selected country
- **Category filtering**: Business, Tech, Sports, Entertainment, etc.
- **Current data**: Uses the latest information available
- **Better accuracy**: More reliable than generic AI responses

## 5. Supported Models

The integration uses the `llama-3.1-sonar-small-128k-online` model which:
- Has real-time web access
- Provides current information
- Is optimized for search and trending topics
- Supports up to 128k tokens

## 6. Cost Considerations

Perplexity API pricing:
- Pay-per-use model
- Competitive rates for real-time data
- No monthly subscriptions required
- Check current pricing at [Perplexity Pricing](https://www.perplexity.ai/pricing)

## 7. Testing

To test if your API key is working:

1. Start your development server: `npm run dev`
2. Go to the Trending Topics page
3. Select a category and country
4. Click "Generate 10 topics"
5. Check the browser console for any API errors

## 8. Troubleshooting

### Common Issues:

**"Perplexity API key not configured"**
- Make sure `PERPLEXITY_API_KEY` is set in your environment variables
- Restart your development server after adding the key

**"Perplexity API error: 401"**
- Check if your API key is correct
- Ensure your Perplexity account has sufficient credits

**"Perplexity API error: 429"**
- You've hit the rate limit
- Wait a few minutes before trying again
- Consider upgrading your Perplexity plan

**"No content received from Perplexity API"**
- Check your internet connection
- Verify the API key is valid
- Check Perplexity API status

## 9. Benefits Over Serper

- **More current data**: Real-time web access
- **Better context**: Understands trending topics better
- **Country-specific**: More accurate regional results
- **No rate limits**: More generous usage limits
- **Better summaries**: More detailed and accurate descriptions

## 10. Fallback Behavior

If Perplexity API fails, the system will:
1. Try to parse any partial response
2. Fall back to generic trending topics
3. Ensure the user always gets 10 topics
4. Log errors for debugging

This ensures your application remains functional even if the API is temporarily unavailable.
