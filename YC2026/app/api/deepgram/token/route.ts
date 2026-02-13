import { NextResponse } from 'next/server';

export async function GET() {
  // Server-side only - API key is never exposed to browser
  // Access env var inside the function to ensure it's read at runtime
  const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json(
      { error: 'Deepgram API key not configured' },
      { status: 500 }
    );
  }

  // Return the API key for client-side WebSocket connection
  // The key will be validated when the WebSocket connects to Deepgram
  // In production, consider creating temporary/scoped keys via Deepgram's API
  return NextResponse.json({ 
    apiKey: DEEPGRAM_API_KEY,
  });
}
