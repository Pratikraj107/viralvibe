import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { prompt, size } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OpenAI API key' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    const imageSize = typeof size === 'string' ? size : '1024x1024';

    // Analyze the content to create a more specific prompt
    const content = prompt.toLowerCase();
    let visualTheme = '';
    let colorScheme = '';
    let specificElements = '';

    // Determine visual theme based on content
    if (content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning')) {
      visualTheme = 'futuristic AI technology, neural networks, digital brain, circuit patterns';
      colorScheme = 'blue, purple, and silver tones';
      specificElements = 'holographic displays, data visualizations, tech interfaces';
    } else if (content.includes('business') || content.includes('startup') || content.includes('entrepreneur')) {
      visualTheme = 'professional business environment, growth charts, handshakes, office settings';
      colorScheme = 'professional blues, grays, and accent colors';
      specificElements = 'charts, graphs, business icons, professional settings';
    } else if (content.includes('health') || content.includes('medical') || content.includes('healthcare')) {
      visualTheme = 'medical technology, healthcare professionals, wellness symbols';
      colorScheme = 'clean whites, medical blues, and health greens';
      specificElements = 'medical equipment, health icons, professional healthcare settings';
    } else if (content.includes('tech') || content.includes('software') || content.includes('digital')) {
      visualTheme = 'modern technology, digital interfaces, coding elements';
      colorScheme = 'tech blues, digital greens, and modern grays';
      specificElements = 'code snippets, digital interfaces, tech gadgets';
    } else if (content.includes('finance') || content.includes('money') || content.includes('investment')) {
      visualTheme = 'financial charts, currency symbols, professional finance';
      colorScheme = 'professional greens, golds, and business colors';
      specificElements = 'charts, graphs, financial symbols, professional settings';
    } else {
      visualTheme = 'professional, modern, clean design';
      colorScheme = 'professional and modern color palette';
      specificElements = 'relevant icons and visual elements';
    }

    const dallePrompt = `Create a professional social media post image for this content: "${prompt}".
    
    Visual Requirements:
    - Theme: ${visualTheme}
    - Color Scheme: ${colorScheme}
    - Key Elements: ${specificElements}
    - Style: Professional, modern, clean, social media optimized
    - Composition: Balanced, visually appealing, supports the written content
    - Quality: High-resolution, professional photography/illustration style
    
    Make the image directly relevant to the specific topic and content mentioned. Avoid generic stock photos - create something that specifically represents the subject matter.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: dallePrompt,
      size: imageSize as any,
      quality: 'hd',
      n: 1,
      response_format: 'b64_json'
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: 'Image generation failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({ imageBase64: b64 });
  } catch (error) {
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      { error: 'Internal server error', details: isProd ? undefined : String((error as any)?.message || error) },
      { status: 500 }
    );
  }
}


