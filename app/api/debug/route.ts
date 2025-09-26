import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    const serperKey = process.env.SERPER_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      keys: {
        openai: openaiKey ? `${openaiKey.substring(0, 8)}...` : 'NOT SET',
        serper: serperKey ? `${serperKey.substring(0, 8)}...` : 'NOT SET',
        supabaseUrl: supabaseUrl ? 'SET' : 'NOT SET',
        supabaseKey: supabaseKey ? 'SET' : 'NOT SET'
      },
      status: 'Environment variables check'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Debug check failed', details: String(error) },
      { status: 500 }
    );
  }
}
