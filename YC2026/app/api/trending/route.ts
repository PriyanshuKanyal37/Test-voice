import { NextRequest, NextResponse } from 'next/server';

// Server-side only - these won't be exposed to the browser
const TRENDING_API_URL =
  process.env.TRENDING_API_URL ||
  'https://n8n.vonex.dpdns.org/webhook/d5d9a6e1-56e9-4a86-b197-5fa56f3a56e1';

// Set to true to use mock data (useful when API is down)
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

const MOCK_TOPICS = [
  {
    rank: 1,
    topic_title: "From Tool User To Debugging Strategist",
    global_context: "As automation platforms become embedded in business operations, the skill gap is shifting from 'can you use the tool' to 'can you fix it when it breaks'. Companies are realizing that debugging automation is a completely different skill set from building automation.",
    why_this_matters: "Most learning content teaches where to click, but nobody teaches the systematic thinking needed when workflows fail at 2 AM. This is the hidden skill that separates hobbyists from professionals.",
    key_questions: [
      "How do you train yourself or a team to think like a debugger rather than just a builder?",
      "What specific debugging rituals separate automation pros from casual builders?",
      "How can companies design more observable and debuggable automation from the start?",
      "What are the most common debugging anti-patterns you see in automation projects?",
      "How does the rise of AI agents change the debugging landscape?"
    ],
    source_tweet_id: "2005336131026755874"
  },
  {
    rank: 2,
    topic_title: "The Hidden Cost of No-Code Scaling",
    global_context: "No-code tools promise rapid development, but teams are discovering unexpected challenges when scaling from prototype to production. The gap between 'it works' and 'it works reliably at scale' is larger than most anticipate.",
    why_this_matters: "Many businesses have built critical processes on no-code foundations without understanding the architectural limitations. This creates technical debt that's invisible until it's too late.",
    key_questions: [
      "At what point should teams consider migrating from no-code to traditional development?",
      "What are the warning signs that a no-code solution is approaching its limits?",
      "How do you calculate the true total cost of ownership for no-code solutions?",
      "What governance frameworks work best for enterprise no-code deployments?",
      "How do you maintain no-code systems when the original builder leaves?"
    ],
    source_tweet_id: "2005336131026755875"
  },
  {
    rank: 3,
    topic_title: "AI-Augmented Content Creation Workflows",
    global_context: "Content creators are moving beyond simple AI writing assistants to fully integrated AI workflows that handle research, ideation, drafting, and optimization. The focus is shifting from 'AI writes for me' to 'AI amplifies my unique voice'.",
    why_this_matters: "The creators who master AI-augmented workflows will produce 10x more high-quality content while maintaining authenticity. Those who don't will struggle to compete.",
    key_questions: [
      "How do you maintain your authentic voice while using AI assistance?",
      "What's the ideal human-AI split for different types of content?",
      "How do you build AI workflows that learn your style over time?",
      "What metrics should creators track to measure AI workflow effectiveness?",
      "How do audiences perceive AI-augmented vs fully human content?"
    ],
    source_tweet_id: "2005336131026755876"
  },
  {
    rank: 4,
    topic_title: "The Rise of Micro-Automation",
    global_context: "Instead of large, complex automation projects, teams are finding success with hundreds of small, focused automations. This 'micro-automation' approach reduces risk and increases adoption across organizations.",
    why_this_matters: "Big automation projects often fail due to scope creep and complexity. Micro-automations deliver value faster and are easier to maintain, debug, and iterate.",
    key_questions: [
      "How do you identify the best candidates for micro-automation?",
      "What's the ideal scope and complexity for a micro-automation?",
      "How do you prevent micro-automation sprawl and maintain governance?",
      "What tools and frameworks best support a micro-automation strategy?",
      "How do you measure and communicate the cumulative impact of micro-automations?"
    ],
    source_tweet_id: "2005336131026755877"
  },
  {
    rank: 5,
    topic_title: "Building a Personal Knowledge Operating System",
    global_context: "Top performers are building sophisticated systems to capture, organize, and leverage their knowledge. These 'knowledge operating systems' combine note-taking, automation, and AI to create compounding intellectual returns.",
    why_this_matters: "In the age of information overload, your competitive advantage comes from how well you process and apply knowledge, not just how much you consume.",
    key_questions: [
      "What are the core components of an effective knowledge operating system?",
      "How do you balance capture with retrieval in your knowledge system?",
      "What role should AI play in your personal knowledge management?",
      "How do you maintain your system without it becoming a burden?",
      "How do you measure the ROI of your knowledge management investment?"
    ],
    source_tweet_id: "2005336131026755878"
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords } = body;

    if (!keywords || typeof keywords !== 'string' || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    // Use mock data when enabled
    if (USE_MOCK_DATA) {
      console.log('Using mock trending topics data');
      return NextResponse.json({ output: { topics: MOCK_TOPICS } });
    }

    // Create abort controller for timeout (2 minutes for deep research)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2 * 60 * 1000);

    try {
      console.log(`Forwarding research request to backend: ${TRENDING_API_URL}`);
      const response = await fetch(TRENDING_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keywords.trim() }), // Backend expects "keyword"
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Backend API error: ${response.status}`, errorText);
        return NextResponse.json(
          { error: `Backend API error: ${response.status}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);

    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        );
      }
      console.error('Fetch error:', fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Trending API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
