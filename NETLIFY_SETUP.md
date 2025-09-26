# Netlify Setup Guide for Video Summarizer

## Required Environment Variables

Add these environment variables in your Netlify dashboard:

### 1. OpenAI API Key
```
OPENAI_API_KEY=sk-your-openai-key-here
```

### 2. Serper API Key
```
SERPER_API_KEY=your-serper-key-here
```

### 3. YouTube Data API Key (REQUIRED for video summarizer)
```
YOUTUBE_API_KEY=your-youtube-api-key-here
```

### 4. Supabase Keys
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How to Get YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy the API key and add it to Netlify environment variables

## Why YouTube Data API?

- **Reliable**: Works consistently in serverless environments
- **Official**: Direct access to YouTube's data
- **Accurate**: Gets real video titles, descriptions, and metadata
- **Netlify Compatible**: No web scraping restrictions

## Testing

After adding the YouTube API key:
1. Deploy to Netlify
2. Test video summarizer with any YouTube URL
3. Check that it generates content based on the actual video
