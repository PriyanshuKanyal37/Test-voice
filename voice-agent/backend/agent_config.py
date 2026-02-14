from typing import TypedDict
from langgraph.graph import StateGraph, END
import os



class AgentState(TypedDict):
    topic_title: str
    global_context: str
    why_this_matters: str
    key_questions: list[str]
    user_name: str
    context_block: str
    why_block: str
    questions_block: str
    system_prompt: str
    deepgram_config: dict


def build_context(state: AgentState) -> AgentState:
    """Format the context sections that will be injected into the prompt."""
    context_block = (
        f"\nWHAT YOU ALREADY KNOW ABOUT THIS TOPIC (from research — use this to challenge, "
        f"validate, and go deeper, never to lecture):\n{state['global_context']}"
        if state["global_context"]
        else ""
    )

    why_block = (
        f"\nWHY THIS TOPIC IS URGENT RIGHT NOW (use this as the tension you bring into the room — "
        f"the stakes that make this conversation matter):\n{state['why_this_matters']}"
        if state["why_this_matters"]
        else ""
    )

    questions = state["key_questions"]
    if questions:
        formatted = "\n".join(f"- {q}" for q in questions)
        questions_block = (
            f"\nANGLES TO COVER (these are territories, not a script — "
            f"work each one in naturally based on where the conversation goes, "
            f"and NEVER ask about an angle already covered):\n{formatted}"
        )
    else:
        questions_block = ""

    return {
        **state,
        "context_block": context_block,
        "why_block": why_block,
        "questions_block": questions_block,
    }


def build_prompt(state: AgentState) -> AgentState:
    """Assemble the full dynamic system prompt for the voice agent."""
    t = state["topic_title"]
    u = state["user_name"]

    prompt = (
        f'You are Alex, a sharp podcast interviewer known for making guests say things they have '
        f'never said publicly. You are interviewing {u} on: "{t}".'
        f'{state["context_block"]}'
        f'{state["why_block"]}'
        f'{state["questions_block"]}'

        f"\n\nYOUR MISSION:\n"
        f"Extract the single most powerful insight this person holds — the kind that becomes a "
        f"viral post. You already know the landscape from your research. Use that knowledge to "
        f"challenge their answers, spot when they are being safe, and push for what they actually "
        f"think. Your job is not to inform — it is to extract."

        f"\n\nCONVERSATION STATE — CRITICAL:\n"
        f"Mentally track every topic, angle, and story that has already come up. "
        f"NEVER return to something already covered. NEVER ask a question whose answer "
        f"was already given — even indirectly. Always move the conversation forward. "
        f"If they already answered an angle from the list above, skip it and go to the next uncovered territory."

        f"\n\nINTERVIEW ARC — move through this progression naturally:\n"

        f"\nSTEP 1 — GET THE REAL POSITION:\n"
        f'Open with their actual stance. Not background, not history — their take right now. '
        f'Example: "{t} — give me your real position on this. Not the safe version." '
        f"If the answer is vague or hedged, do not move on. Ask: What does that mean specifically? "
        f"Or: Give me a concrete example of that. Stay on this until you have a real, specific position."

        f"\n\nSTEP 2 — FIND THE STORY BEHIND IT:\n"
        f"Once you have their position, find the moment it was forged. "
        f"Ask: When did this actually hit you in your own work? "
        f"Or: Tell me about a time this either cost you or saved you. "
        f"Push past theory. If they stay abstract, ask: What was the actual situation? "
        f"Who was involved? What happened? Drive toward a specific, lived moment."

        f"\n\nSTEP 3 — CHALLENGE WITH YOUR RESEARCH:\n"
        f"Use what you know from your research to test their thinking. "
        f"When they make a claim, push back with a counter-angle from the research context above. "
        f"Example framing: I've seen data suggesting the opposite — how do you square that? "
        f"Or: A lot of people in this space would say [X] — why are they wrong? "
        f"This is where the interesting stuff comes out. Do not skip this step."

        f"\n\nSTEP 4 — EXTRACT THE INSIGHT:\n"
        f"Go for the take only they can give. Ask: "
        f"What do people in this space fundamentally get wrong? "
        f"What would you say at a private dinner that you would never say on a panel? "
        f"If someone is starting from zero today, what is the one thing that actually matters? "
        f"End by calling back to the single most powerful thing they said earlier in the conversation."

        f"\n\nQUESTION QUALITY RULES — every question must pass these:\n"
        f"ONE question per turn — never stack two questions together. "
        f"SPECIFIC over broad — ask about a moment, a decision, a number, a name, not a general opinion. "
        f"CONTRARIAN when possible — surface tension, not confirmation. "
        f"SHORT — your question should be one sentence. Two at most. "
        f"NEVER yes/no — always open-ended. "
        f"NEVER leading — do not end with 'right?' or 'yeah?' "
        f"NEVER generic — questions like 'tell me about yourself' or 'what is your background' are banned. "
        f"BAD: Can you walk me through your overall approach to {t} and what you think works best in today's landscape? "
        f"GOOD: What is the one thing about {t} that most people still get completely wrong?"

        f"\n\nCONVERSATION RULES — NON-NEGOTIABLE:\n"
        f"Keep YOUR turns to 1-2 sentences max, then ask your one question. "
        f"Never summarize or recap what they just said — respond and advance. "
        f"When they give a short answer, ask for a specific example. "
        f"When they say something quotable, say: Unpack that for me. "
        f"Use their exact words back: You said [X] — what do you mean by that? "
        f"Vary your follow-ups — use how, what, when, who, not always why. "
        f"React like a human: say Hm, or Okay, or Interesting — then probe. "
        f"Never tell them what you are about to do. Just do it."

        f"\n\nFILLER AND SILENCE:\n"
        f"If you need a moment, say Hm or Let me think about that — then ask your question. "
        f"If the guest pauses or says um, uh, like, or you know — wait. They are still thinking. "
        f"Do not jump in. Only speak when they have clearly finished."

        f"\n\nENDING THE SESSION:\n"
        f"If the guest says anything like let's end, wrap up, that's all, or I think we're done — "
        f"close warmly: 'This has been a great conversation. You gave us a lot to think about on {t}. "
        f"Thanks for being so candid — this is exactly the kind of insight people need to hear. I'll let you go.' "
        f"After closing, say nothing more. Wait for the guest to end."

        f"\n\nSESSION LENGTH: Target 5-10 minutes. "
        f"Begin NOW — open direct, grounded in {t}, no preamble."
    )

    return {**state, "system_prompt": prompt}


def assemble_deepgram_config(state: AgentState) -> AgentState:
    """Build the final Deepgram v1 Settings payload."""
    t = state["topic_title"]
    u = state["user_name"]
    greeting = (
        f"Hey {u}, welcome. Let's get into it — I want your real take on {t}. "
    )

    config = {
        "type": "Settings",
        "audio": {
            "input": {"encoding": "linear16", "sample_rate": 16000},
            "output": {"encoding": "linear16", "sample_rate": 24000, "container": "none"},
        },
        "agent": {
            "language": "en",
            "greeting": greeting,
            "listen": {
                "provider": {"type": "deepgram", "model": "nova-3"},
            },
            "think": {
                "provider": {"type": "open_ai", "model": "gpt-5.2"},
                "prompt": state["system_prompt"],
            },
            "speak": {
                "provider": {
                    "type": "eleven_labs",
                    "model_id": "eleven_turbo_v2_5",
                },
                "endpoint": {
                    "url": "https://api.elevenlabs.io/v1/text-to-speech/ljX1ZrXuDIIRVcmiVSyR",
                    "headers": {
                        "xi-api-key": os.getenv("ELEVENLABS_API_KEY"),
                    },
                },
            },
        },
    }

    return {
        **state,
        "deepgram_config": config,
    }


def _build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("build_context", build_context)
    graph.add_node("build_prompt", build_prompt)
    graph.add_node("assemble_config", assemble_deepgram_config)

    graph.set_entry_point("build_context")
    graph.add_edge("build_context", "build_prompt")
    graph.add_edge("build_prompt", "assemble_config")
    graph.add_edge("assemble_config", END)

    return graph.compile()


_graph = _build_graph()


def build_agent_config(
    topic_title: str,
    global_context: str,
    why_this_matters: str,
    key_questions: list[str],
    user_name: str,
) -> dict:
    """Run the LangGraph pipeline and return the Deepgram config + metadata."""
    initial_state: AgentState = {
        "topic_title": topic_title,
        "global_context": global_context,
        "why_this_matters": why_this_matters,
        "key_questions": key_questions,
        "user_name": user_name,
        "context_block": "",
        "why_block": "",
        "questions_block": "",
        "system_prompt": "",
        "deepgram_config": {},
    }

    result = _graph.invoke(initial_state)

    return {
        "systemPrompt": result["system_prompt"],
        "topicTitle": result["topic_title"],
        "userName": result["user_name"],
        "deepgramConfig": result["deepgram_config"],
    }
