import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import OpenAI from 'openai';

// Mock search function - In production, replace with actual search API
async function searchWeb(topic: string): Promise<string[]> {
  // Simulate web search results
  const mockResults = [
    `${topic} is gaining significant attention in recent industry reports and discussions.`,
    `Latest trends and developments in ${topic} show promising growth and innovation.`,
    `Experts predict that ${topic} will continue to evolve and impact various sectors.`,
    `Recent studies highlight the importance and benefits of ${topic} in modern applications.`,
    `Industry leaders are increasingly investing in ${topic} related technologies and solutions.`
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockResults;
}

// OpenAI-powered generation
async function generateAIContent(
  topic: string,
  searchResults: string[],
  numVariants: number = 3
): Promise<{ tweets: string[]; linkedinPosts: string[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback to simple mock if key missing
    const tweets = Array.from({ length: numVariants }).map((_, i) => `🚀 ${i + 1}/ ${topic} insights:\n\n✨ Innovation at its finest\n📈 Rapid adoption\n🌟 Big potential ahead\n\nYour take on ${topic}? #Innovation #${topic.replace(/\s+/g, '')} #TechTrends`);
    const linkedinPosts = Array.from({ length: numVariants }).map((_, i) => `🌟 (${i + 1}/${numVariants}) The Future of ${topic}\n\n🔍 Key Observations:\n• Rapid innovation\n• Meaningful investments\n• Early wins emerging\n• Cross-sector potential\n\n💡 Why it matters:\n${topic} is reshaping efficiency and decision-making. Early adopters build durable advantages.\n\n📈 Looking ahead:\nExpect ${topic} to become core to strategy and operations. How are you approaching it?\n\n#${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork #Technology`);
    return { tweets, linkedinPosts };
  }

  const openai = new OpenAI({ apiKey });

  const system = `You're a skilled social media writer who creates authentic, engaging content. Write like a real person sharing genuine insights, not an AI. Use natural language, personal opinions, and conversational tone. Avoid corporate speak, excessive emojis, or obvious AI patterns. Write as if you're genuinely excited about the topic and sharing your thoughts with friends or colleagues. Return JSON with "tweets" and "linkedinPosts" arrays.`;
  const user = `Write about: ${topic}\n\nContext: ${searchResults.slice(0, 5).join(' | ')}\n\nCreate ${numVariants} different Twitter posts and ${numVariants} different LinkedIn posts. Make each one sound like it's written by a real person with genuine interest in the topic.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.8,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  let parsed: { tweets?: string[]; linkedinPosts?: string[] } = {};
  try {
    parsed = JSON.parse(content);
  } catch {}

  const tweets = Array.isArray(parsed.tweets) ? parsed.tweets.slice(0, numVariants) : [];
  const linkedinPosts = Array.isArray(parsed.linkedinPosts) ? parsed.linkedinPosts.slice(0, numVariants) : [];

  // Fallback if model didn't follow
  if (tweets.length === 0 || linkedinPosts.length === 0) {
    const fallbackTweets = Array.from({ length: numVariants }).map((_, i) => `🚀 ${i + 1}/ ${topic} insights:\n\n✨ Innovation at its finest\n📈 Rapid adoption\n🌟 Big potential ahead\n\nYour take on ${topic}? #Innovation #${topic.replace(/\s+/g, '')} #TechTrends`);
    const fallbackLinkedin = Array.from({ length: numVariants }).map((_, i) => `🌟 (${i + 1}/${numVariants}) The Future of ${topic}\n\n🔍 Key Observations:\n• Rapid innovation\n• Meaningful investments\n• Early wins emerging\n• Cross-sector potential\n\n💡 Why it matters:\n${topic} is reshaping efficiency and decision-making. Early adopters build durable advantages.\n\n📈 Looking ahead:\nExpect ${topic} to become core to strategy and operations. How are you approaching it?\n\n#${topic.replace(/\s+/g, '')} #Innovation #FutureOfWork #Technology`);
    return { tweets: tweets.length ? tweets : fallbackTweets, linkedinPosts: linkedinPosts.length ? linkedinPosts : fallbackLinkedin };
  }

  return { tweets, linkedinPosts };
}

export async function POST(request: NextRequest) {
  try {
    const { topic, mode } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    // Trim and validate topic
    const cleanTopic = topic.trim();
    if (cleanTopic.length === 0) {
      return NextResponse.json(
        { error: 'Topic cannot be empty' },
        { status: 400 }
      );
    }

    // Search the web for relevant information (replace with real search provider as needed)
    const searchResults = await searchWeb(cleanTopic);

    // Generate AI content (3-4 variants)
    const variants = Math.floor(Math.random() * 2) + 3; // 3 or 4
    let tweets: string[] = [];
    let linkedinPosts: string[] = [];
    try {
      const ai = await generateAIContent(cleanTopic, searchResults, variants);
      tweets = ai.tweets;
      linkedinPosts = ai.linkedinPosts;
    } catch (aiError: any) {
      console.error('OpenAI generation error:', aiError);
      const isProd = process.env.NODE_ENV === 'production';
      return NextResponse.json(
        {
          error: 'Content generation failed',
          details: isProd ? undefined : String(aiError?.message || aiError),
        },
        { status: 502 }
      );
    }

    // Optional extra content modes
    let threads: string[][] | undefined;
    let instagramPosts: string[] | undefined;
    if (mode === 'twitter_threads' || mode === 'instagram') {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
          const openai = new OpenAI({ apiKey });
          if (mode === 'twitter_threads') {
            // Get real-time examples for threads
            const serperKey = process.env.SERPER_API_KEY;
            let realExamples = '';
            if (serperKey) {
              try {
                const serperRes = await fetch('https://google.serper.dev/search', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'X-API-KEY': serperKey },
                  body: JSON.stringify({ q: `${cleanTopic} examples news 2024`, gl: 'us', hl: 'en', num: 5 })
                });
                const serperData: any = await serperRes.json();
                if (Array.isArray(serperData?.organic)) {
                  realExamples = serperData.organic.slice(0, 3).map((r: any) => `${r.title}: ${r.snippet}`).join('\n');
                }
              } catch (e) {
                console.warn('Serper search failed for threads:', e);
              }
            }

            const system = 'You write engaging Twitter threads that sound like they come from a knowledgeable person sharing insights. Write naturally, use real examples, and make it conversational. Each thread should be 4-6 tweets that flow together. Return JSON {"threads": string[][]}.';
            const user = `Write 2 different Twitter threads about: ${cleanTopic}. 
Context: ${searchResults.slice(0,5).join(' | ')}
Examples: ${realExamples || 'Use your knowledge of recent trends'}
Make each thread sound like a real expert sharing genuine insights, not AI-generated content.`;
            const resp = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
              response_format: { type: 'json_object' },
              temperature: 0.8
            });
            const content = resp.choices[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed?.threads)) threads = parsed.threads;
          } else if (mode === 'instagram') {
            const system = 'Write Instagram captions that sound like they come from a real person sharing their thoughts. Use natural language, appropriate emojis, and relevant hashtags. Make it conversational and authentic. Return JSON {"instagramPosts": string[]}.';
            const user = `Write 3 different Instagram captions about: ${cleanTopic}. 
Context: ${searchResults.slice(0,5).join(' | ')}
Make each caption sound like a genuine person sharing their perspective, not AI-generated content.`;
            const resp = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
              response_format: { type: 'json_object' },
              temperature: 0.8
            });
            const content = resp.choices[0]?.message?.content ?? '{}';
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed?.instagramPosts)) instagramPosts = parsed.instagramPosts;
          }
        }
      } catch (err) {
        console.warn('Optional mode generation failed:', err);
      }
    }

    return NextResponse.json({
      topic: cleanTopic,
      tweets,
      linkedinPosts,
      searchResults,
      threads,
      instagramPosts,
    });

  } catch (error) {
    console.error('Error generating content:', error);
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: 'Internal server error', details: isProd ? undefined : String((error as any)?.message || error) },
      { status: 500 }
    );
  }
}