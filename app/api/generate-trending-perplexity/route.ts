import { NextRequest, NextResponse } from 'next/server';

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

    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;
    if (!perplexityApiKey) {
      return NextResponse.json({ error: 'Perplexity API key not configured' }, { status: 500 });
    }

    // Create a specific query for Perplexity based on category and country
    const categoryQueries: Record<string, string> = {
      Business: `trending business news startups investments market trends in ${countryCode}`,
      Tech: `trending tech news AI software apps startups technology trends in ${countryCode}`,
      Sports: `trending sports news athletes teams games sports events in ${countryCode}`,
      Entertainment: `trending entertainment news celebrities shows music events in ${countryCode}`,
      Movies: `trending movie news films actors directors box office in ${countryCode}`,
      Politics: `trending political news politicians elections policies in ${countryCode}`,
      Science: `trending science news research discoveries scientific breakthroughs in ${countryCode}`,
      Health: `trending health news medical wellness healthcare trends in ${countryCode}`,
      Products: `trending tech products gadgets devices new releases in ${countryCode}`,
    };

    const query = categoryQueries[normalized];
    
    console.log(`Fetching trending topics for ${normalized} in ${countryCode} using Perplexity API`);

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a trending topics analyst. Find the most current and relevant trending topics, keywords, and hashtags for the given category and country. Return exactly 10 trending topics with titles and summaries. Focus on what's actually trending right now with real data and current events.`
          },
          {
            role: 'user',
            content: `Find 10 current trending topics, keywords, and hashtags for ${normalized} in ${countryCode.toUpperCase()}. Include specific trending terms, popular search queries, and current events. For each topic, provide:
            1. A concise title (under 90 characters)
            2. A brief summary (1-2 sentences) explaining why it's trending and what makes it relevant now
            
            Focus on topics that are actively being discussed, searched, and shared on social media right now. Include relevant keywords and hashtags. Return the response as a JSON array with this exact structure:
            [
              {
                "title": "Topic Title",
                "summary": "Brief explanation of why this is trending now"
              }
            ]
            
            Query: ${query}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
        return_citations: false,
        search_domain_filter: [],
        search_recency_filter: "month"
      })
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', perplexityResponse.status, errorText);
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const perplexityData = await perplexityResponse.json();
    console.log('Perplexity API response received');

    // Extract the content from Perplexity response
    const content = perplexityData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content received from Perplexity API');
    }

    // Try to parse JSON from the response
    let topics = [];
    try {
      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        topics = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array found, try to extract topics from text
        const lines = content.split('\n').filter((line: string) => line.trim());
        topics = lines.slice(0, 10).map((line: string, index: number) => ({
          title: line.replace(/^\d+\.\s*/, '').split(':')[0]?.trim() || `${normalized} trending topic ${index + 1}`,
          summary: line.split(':')[1]?.trim() || `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest.`
        }));
      }
    } catch (parseError) {
      console.error('Error parsing Perplexity response:', parseError);
      // Fallback: create topics from the raw content
      const lines = content.split('\n').filter((line: string) => line.trim());
      topics = lines.slice(0, 10).map((line: string, index: number) => ({
        title: line.replace(/^\d+\.\s*/, '').split(':')[0]?.trim() || `${normalized} trending topic ${index + 1}`,
        summary: line.split(':')[1]?.trim() || `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest.`
      }));
    }

    // Ensure we have exactly 10 topics
    const formattedTopics = [];
    for (let i = 0; i < 10; i++) {
      if (topics[i] && topics[i].title && topics[i].summary) {
        formattedTopics.push({
          title: topics[i].title,
          summary: topics[i].summary
        });
      } else {
        // Fallback topic
        formattedTopics.push({
          title: `${normalized} trending topic ${i+1}`,
          summary: `This ${normalized.toLowerCase()} topic is currently trending and generating significant interest among users and media outlets. It represents current market trends and discussions in the ${normalized.toLowerCase()} space.`
        });
      }
    }

    console.log(`Successfully generated ${formattedTopics.length} trending topics for ${normalized}`);
    return NextResponse.json({ topics: formattedTopics });

  } catch (error) {
    console.error('Perplexity trending topics API error:', error);
    
    // Fallback: Return 10 generic topics if everything fails
    const fallbackTopics = Array.from({ length: 10 }).map((_, i) => ({
      title: `Trending topic ${i+1}`,
      summary: `This topic is currently trending and generating significant interest among users and media outlets. It represents current market trends and discussions.`
    }));
    
    return NextResponse.json({ topics: fallbackTopics });
  }
}
