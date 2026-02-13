import { NextRequest, NextResponse } from 'next/server';

// Server-side only - these won't be exposed to the browser
const BACKEND_URL =
  process.env.BACKEND_URL ||
  'https://voice-agent-1jao.onrender.com';

// Set to true to use mock data (useful when API is down)
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    // Use mock data when enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock LinkedIn content');
      const mockContent = `3 years of working with ${topic || 'automation'}.

The mistake everyone makes isn't the tool.

It's assuming automation means less work.

Here's what I've learned the hard way:

Automation doesn't replace humans. It amplifies them.

When we automated our workflows, something unexpected happened.
Our team finally had TIME for meaningful conversations.

The ROI of automation isn't just efficiency.
It's human connection at scale.

Stop asking "What can I automate?"
Start asking "What should my humans focus on?"

The answer changes everything.

#Automation #AI #Productivity`;

      return NextResponse.json({ linkedin: mockContent });
    }

    const response = await fetch(`${BACKEND_URL}/generate-linkedin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `LinkedIn generation failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('LinkedIn API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
