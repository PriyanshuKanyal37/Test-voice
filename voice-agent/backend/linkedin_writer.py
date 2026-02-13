import os
import random
from openai import OpenAI
from typing import Optional

def get_random_template(content_type: str, topic: str, base_rules: str) -> str:
    """Selects a random structural template based on content type."""
    rand = random.random()
    
    # PERSONAL STORY - 4 VARIATIONS
    if content_type == 'personal-story':
        if rand < 0.25:
            return f"""{base_rules}

TEMPLATE: Linear Personal Story (Action-First)

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Strong action statement (NO timeframe - dive right in)

What was happening (context from transcript)

The turning point

What changed/The Insight

Outcome (specific, from transcript)

Reflection question

EXAMPLE FLOW:
"My team was losing 30 minutes daily...
Everyone knew what they did...
Built a simple bot...
Result: Team saves 2.5 hours weekly...
Sometimes the best tools solve memory problems...
What's one process you automated?"

WRITE THE POST NOW in this style used the transcripts:"""

        elif rand < 0.5:
            return f"""{base_rules}

TEMPLATE: Reverse Reveal Story

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Bold outcome statement (what happened/result - NO timeframe)

Wait, how? (create curiosity)

Flashback to situation (context from transcript)

What was actually done (specific action)

Why it worked (key insight)

Closing thought

EXAMPLE FLOW:
"I almost didn't pitch this $15K project.
Why? Spreadsheet said $8K.
But I realized...
Quoted $15K. They said yes.
Clients price by risk, not effort.
What's a project you underpriced?"

WRITE THE POST NOW in this style using the transcript:"""

        elif rand < 0.75:
            return f"""{base_rules}

TEMPLATE: Before/After Contrast

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Used to [old behavior mentioned in transcript]
Now [new behavior/insight]

The shift happened when [catalyst]

Before state (describe the pain)

After state (describe improvement)

The one thing that made difference

Question for readers

EXAMPLE FLOW:
"Used to spend 4 hours on outreach.
Now I spend 45 mins.
The shift: Automation.
Before: Manual, exhausting.
After: Automatic, personalized.
Best automation handles data, not relationships.
What manual task are you doing?"

WRITE THE POST NOW in this style using the transcript:"""

        else:
            return f"""{base_rules}

TEMPLATE: Vulnerable/Honest Confession

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Honest confession or mistake (from transcript - NO timeframe)

Why this mattered (stakes/emotion)

What was tried first (struggle)

What actually worked (solution)

Key learning

Empowering question

EXAMPLE FLOW:
"I quoted $5K for $8K work.
Felt relief, not excitement.
Optimizing for comfort over growth.
Next pitch: $12K. Uncomfortable.
But discomfort is a compass.
What are you undercharging for?"

WRITE THE POST NOW in this style using the transcript:"""

    # CAREER CHALLENGE - 4 VARIATIONS (Mapped to 'Professional Insight' for Podcast)
    elif content_type == 'career-challenge':
        if rand < 0.25:
            return f"""{base_rules}

TEMPLATE: Pattern Recognition (Insight)

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
I kept noticing [pattern from transcript] (NO specific timeframe)

Every time [trigger], [result] happened

The real issue was [deep insight]

How to approach it (solution)

What's still a work in progress

Question for others

WRITE THE POST NOW in this style using the transcript:"""

        elif rand < 0.5:
            return f"""{base_rules}

TEMPLATE: Moment of Clarity

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Specific moment that changed perspective (from transcript)

Here's what happened (scene setting)

The realization (specific insight)

Why it wasn't obvious before

What is done differently now

Invitation for others to share

WRITE THE POST NOW in this style using the transcript:"""

        elif rand < 0.75:
            return f"""{base_rules}

TEMPLATE: Problem-Agitate-Solve

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
The problem (clear, relatable - NO timeframe)

Why it got worse (agitate the pain from transcript)

Failed attempts (what didn't work)

What finally worked (specific solution)

Current state (honest results)

Question for others

WRITE THE POST NOW in this style using the transcript:"""

        else:
            return f"""{base_rules}

TEMPLATE: Contrarian Take

Write about: "{topic}" (Based on the Transcript)

STRUCTURE:
Unpopular opinion about [topic]

Why conventional wisdom says opposite

Experience proving it wrong (from transcript)

Why this approach works

When it might NOT work (nuance)

Open question for debate

WRITE THE POST NOW in this style using the transcript:"""
            
    # DEFAULT / FALLBACK
    else:
        return f"""{base_rules}

Write a professional personal LinkedIn post about: "{topic}" based on the transcript.

Keep it authentic, specific, and use the voice guidelines above.

REMEMBER: Vary your opening line. Don't start with a timeframe unless it's truly essential."""


def generate_linkedin_post(topic: str, user_name: str, transcript: str, writing_style: str = "authentic, professional", content_type: Optional[str] = None) -> str:
    """
    Generate a viral LinkedIn post from podcast transcript using dynamic 'Nick Sarra' style templates.
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))

    # If content_type is not provided, randomly select one to ensure variety
    if not content_type:
        content_type = random.choice(['personal-story', 'career-challenge'])

    # BASE RULES (Ported from contentService.js with Podcast Context injected)
    base_rules = f"""
YOU ARE: A LinkedIn ghostwriter writing for {user_name}.

SOURCE MATERIAL:
You are writing based on the provided PODCAST TRANSCRIPT.
- Do NOT invent stories.
- Extract the specific story, insight, or lesson from the transcript that fits the selected template.
- Use the guest's/speaker's actual words and phrasing where possible for authenticity.

WRITING VOICE: {writing_style}
TRANSCRIPT CONTEXT: The speaker is {user_name} (or the guest). Write from their perspective ("I").

PROFESSIONAL PERSONAL VOICE:
✓ Use "I/me/my" naturally
✓ Share specific details from the transcript (numbers, tools, specific moments)
✓ Sound polished but conversational (like advising a colleague)
✓ Show authentic experience, not generic advice

CRITICAL - OPENING LINE VARIETY:
❌ DO NOT start with "[Time period] ago, I..." unless essential
❌ DO NOT force timeframes into every opening
✓ Vary openings:
  - Start with action: "I quoted $8K..."
  - Start with realization: "My manager called me out..."
  - Start with contrast: "Used to X, now I Y"
  - Start with pattern: "Every time I do X..."
  - Start with NO timeframe

❌ AVOID:
- Corporate buzzwords: "leveraged", "synergized", "optimized"
- Repetitive patterns: "Last month/week/year, I..."
- Guru speak: "Here's what nobody tells you"
- Generic advice: "Always do X"

FORMATTING:
- Short lines (10-20 words max)
- Blank line after every 2-3 sentences
- Natural paragraph flow
- End with: "Found this valuable? Feel free to repost ♻️" (unless template says otherwise)

TRANSCRIPT:
{transcript}
"""

    # Select the specific template structure
    final_prompt = get_random_template(content_type, topic, base_rules)

    completion = client.chat.completions.create(
        model="gpt-4o",  # Or 'gpt-4-turbo'
        messages=[
            {"role": "system", "content": "You are a world-class LinkedIn ghostwriter."},
            {"role": "user", "content": final_prompt}
        ],
        temperature=0.7, # Slightly lower temperature for consistency with transcript
        max_tokens=1000
    )

    return (completion.choices[0].message.content or "").strip()
