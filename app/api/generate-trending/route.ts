import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
export const dynamic = 'force-dynamic';

const allowed = ['Business','Tech','Sports','Entertainment','Movies','Politics','Science','Health','Products'];

export async function POST(request: NextRequest) {
  try {
    const { category, country } = await request.json();
    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'category is required' }, { status: 400 });
    }
    const normalized = category.trim();
    const countryCode = typeof country === 'string' && country.length === 2 ? country.toLowerCase() : 'us';
    if (!allowed.includes(normalized)) {
      return NextResponse.json({ error: 'Unsupported category' }, { status: 400 });
    }

    // Prefer real-time news when available via Serper.dev
    const serperKey = process.env.SERPER_API_KEY;
    const catQuery: Record<string, string> = {
      Business: 'trending business keywords hashtags startups investments',
      Tech: 'trending tech keywords hashtags AI software apps startups',
      Sports: 'trending sports keywords hashtags athletes teams games',
      Entertainment: 'trending entertainment keywords hashtags celebrities shows',
      Movies: 'trending movie keywords hashtags actors directors franchises',
      Politics: 'trending political keywords hashtags politicians elections',
      Science: 'trending science keywords hashtags research discoveries',
      Health: 'trending health keywords hashtags medical wellness',
      Products: 'trending tech products keywords hashtags gadgets devices',
    };
    if (serperKey) {
      const serperRes = await fetch('https://google.serper.dev/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': serperKey,
        },
        body: JSON.stringify({ q: catQuery[normalized], gl: countryCode, hl: 'en', num: 10 })
      });
            const serperData: any = await serperRes.json();
            const titles = Array.isArray(serperData?.news)
              ? serperData.news.map((n: any, index: number) => {
                  const baseSummary = n?.snippet || n?.description || `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest among users and media outlets.`;
                  const enhancedSummary = `${baseSummary} This topic is gaining momentum due to recent developments, user engagement, and media coverage. It represents current trends and discussions in the ${normalized.toLowerCase()} space.`;
                  const articleLink = n?.link ? `\n\nRead more: ${n.link}` : '';
                  
                  return {
                    title: n?.title || `Trending ${normalized} topic ${index + 1}`,
                    summary: enhancedSummary + articleLink
                  };
                }).filter(Boolean).slice(0, 10)
              : [];
            if (titles.length) {
              return NextResponse.json({ topics: titles });
            }
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Simple mock when no providers are configured
      const mockTopics = Array.from({ length: 10 }).map((_, i) => ({
        title: `${normalized} trending topic ${i+1}`,
        summary: `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest among users and media outlets. It represents current market trends and discussions in the ${normalized.toLowerCase()} space.`
      }));
      return NextResponse.json({ topics: mockTopics });
    }

    const openai = new OpenAI({ apiKey });
    const system = 'You\'re a knowledgeable analyst who identifies current trending topics, keywords, and hashtags. Write trending topics that people are actually searching for and talking about. Include relevant keywords, hashtags, and trending terms. Each topic should be a specific, actionable trending topic that users can create content about. Return JSON {"topics": [{"title": string, "summary": string}]} with exactly 10 trending topics, each having a title and summary.';
    
    let user = `Find 10 current trending topics, keywords, and hashtags in ${normalized}. Include popular search terms, trending hashtags, and topics people are actively discussing. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Make them sound like real trending topics with relevant keywords. Return exactly 10 topics.`;
    
    if (normalized === 'Products') {
      user = `Find 10 latest trending tech products, gadgets, devices, and new releases that are popular today. Include product names, brand names, and trending tech keywords people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Focus on new product launches, innovative devices, and trending tech products. Return exactly 10 topics.`;
    } else if (normalized === 'Tech') {
      user = `Find 10 current trending tech topics, keywords, and hashtags. Include AI, software, apps, startups, tech companies, and trending tech terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Movies') {
      user = `Find 10 current trending movie topics, keywords, and hashtags. Include movie titles, actors, directors, franchises, and trending entertainment terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Politics') {
      user = `Find 10 current trending political topics, keywords, and hashtags. Include politicians, policies, elections, and trending political terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Sports') {
      user = `Find 10 current trending sports topics, keywords, and hashtags. Include athletes, teams, leagues, games, and trending sports terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Business') {
      user = `Find 10 current trending business topics, keywords, and hashtags. Include companies, startups, investments, markets, and trending business terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Science') {
      user = `Find 10 current trending science topics, keywords, and hashtags. Include research, discoveries, scientists, and trending science terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Health') {
      user = `Find 10 current trending health topics, keywords, and hashtags. Include medical breakthroughs, health trends, wellness, and trending health terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    } else if (normalized === 'Entertainment') {
      user = `Find 10 current trending entertainment topics, keywords, and hashtags. Include celebrities, shows, music, events, and trending entertainment terms people are searching for. For each topic, provide a title (under 90 characters) and a brief summary (1-2 sentences explaining why it's trending). Return exactly 10 topics.`;
    }
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    const content = resp.choices[0]?.message?.content ?? '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch {}
    const topics: any[] = Array.isArray(parsed.topics) ? parsed.topics.slice(0,10) : [];
    
    // Ensure we have exactly 10 topics with proper structure
    const formattedTopics = [];
    for (let i = 0; i < 10; i++) {
      if (topics[i] && topics[i].title && topics[i].summary) {
        formattedTopics.push({
          title: topics[i].title,
          summary: topics[i].summary
        });
      } else {
        // Simple fallback topic
        formattedTopics.push({
          title: `${normalized} trending topic ${i+1}`,
          summary: `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest among users and media outlets. It represents current market trends and discussions in the ${normalized.toLowerCase()} space.`
        });
      }
    }
    
    return NextResponse.json({ topics: formattedTopics });
  } catch (error) {
    console.error('Trending topics API error:', error);
    
    // Fallback: Return 10 generic topics if everything fails
    const fallbackTopics = Array.from({ length: 10 }).map((_, i) => ({
      title: `Trending topic ${i+1}`,
      summary: `This topic is currently trending and generating significant interest among users and media outlets. It represents current market trends and discussions.`
    }));
    
    return NextResponse.json({ topics: fallbackTopics });
  }
}


