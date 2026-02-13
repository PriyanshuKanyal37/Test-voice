"""
Transcript processor — formats and returns raw transcript only.
"""


def process_transcript(
    topic: str,
    user_name: str,
    messages: list[dict],
    duration: int,
) -> dict:
    lines = []
    for m in messages:
        role = m.get("role", "")
        content = (m.get("content") or "").strip()
        if not content:
            continue
        speaker = user_name if role == "user" else "Alex (AI Host)"
        lines.append(f"{speaker}: {content}")

    transcript_text = "\n\n".join(lines)
    duration_str = f"{duration // 60} min {duration % 60} sec"

    return {
        "success": True,
        "topic": topic,
        "userName": user_name,
        "duration": duration_str,
        "transcript": transcript_text,
        "content": {
            "linkedin": "",
            "twitter": "",
        },
    }
