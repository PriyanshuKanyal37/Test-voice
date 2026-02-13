# Podcast Studio — Backend API

FastAPI + LangGraph backend for the AI voice podcast interview system.
Builds dynamic Deepgram Voice Agent configs and generates LinkedIn content from transcripts.

---

## Stack

| Layer | Tech |
|---|---|
| HTTP API | FastAPI |
| Config pipeline | LangGraph |
| Voice agent | Deepgram Voice Agent v1 |
| LLM (interview) | OpenAI gpt-4o-mini (via Deepgram) |
| LLM (LinkedIn) | OpenAI gpt-4o |
| Python | 3.11+ |

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app, routes
├── agent_config.py          # LangGraph pipeline → Deepgram Settings payload
├── transcript_processor.py  # Formats raw conversation messages into transcript text
├── linkedin_writer.py       # Generates viral LinkedIn posts from transcript
├── requirements.txt
├── .env                     # Your secrets (not committed)
└── .env.example             # Template
```

---

## Setup

### 1. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Create `.env`

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

### 3. Run the server

```bash
python main.py
# or
uvicorn main:app --reload --port 8000
```

Server runs at `http://localhost:8000`.

---

## API Endpoints

### `GET /health`

Health check.

**Response:**
```json
{ "status": "ok" }
```

---

### `POST /agent-config`

Builds a complete Deepgram Voice Agent v1 `Settings` payload from topic data.
The UI sends this JSON directly to Deepgram's WebSocket after opening the connection.

**Request body:**
```json
{
  "topic": "AI automation for small businesses",
  "userName": "Sarah Chen",
  "topic_title": "AI automation for small businesses",   // optional, same as topic
  "global_context": "...",                               // optional
  "why_this_matters": "...",                             // optional
  "key_questions": ["...", "..."]                        // optional
}
```

At minimum, send `topic` and `userName`. The rest enriches the interview prompt.

**Response:**
```json
{
  "systemPrompt": "...",
  "topicTitle": "AI automation for small businesses",
  "userName": "Sarah Chen",
  "deepgramConfig": {
    "type": "Settings",
    "audio": {
      "input": { "encoding": "linear16", "sample_rate": 16000 },
      "output": { "encoding": "linear16", "sample_rate": 24000, "container": "none" }
    },
    "agent": {
      "language": "en",
      "greeting": "Hey Sarah Chen, welcome. ...",
      "listen": { "provider": { "type": "deepgram", "model": "nova-3" } },
      "think": {
        "provider": { "type": "open_ai", "model": "gpt-4o-mini" },
        "prompt": "..."
      },
      "speak": { "provider": { "type": "deepgram", "model": "aura-2-thalia-en" } }
    }
  }
}
```

The UI should take `deepgramConfig` and send it as-is to the Deepgram WebSocket.

---

### `POST /transcript`

Formats raw conversation messages into a readable transcript.
Call this when the session ends (user clicks End button).

**Request body:**
```json
{
  "topic": "AI automation for small businesses",
  "userName": "Sarah Chen",
  "messages": [
    { "role": "user", "content": "I think automation is overhyped." },
    { "role": "assistant", "content": "Interesting — unpack that for me." }
  ],
  "duration": 312
}
```

`messages` comes from Deepgram `ConversationText` events (see WebSocket integration below).
`duration` is the session length in seconds.

**Response:**
```json
{
  "success": true,
  "topic": "AI automation for small businesses",
  "userName": "Sarah Chen",
  "duration": "5 min 12 sec",
  "transcript": "Sarah Chen: I think automation is overhyped.\n\nAlex (AI Host): Interesting — unpack that for me.",
  "content": { "linkedin": "", "twitter": "" }
}
```

---

### `POST /generate-linkedin`

Generates a viral LinkedIn post from the transcript using GPT-4o.
Prompt is based on analysis of 10k+ high-engagement posts: hook, story arc, turn moment, quotable close, specific CTA.

**Request body:**
```json
{
  "topic": "AI automation for small businesses",
  "userName": "Sarah Chen",
  "transcript": "Sarah Chen: I think automation is overhyped.\n\nAlex (AI Host): ..."
}
```

**Response:**
```json
{
  "linkedin": "3 years automating businesses. The mistake everyone makes isn't the tool...\n\n..."
}
```

---

## Deepgram WebSocket Integration (for UI team)

The voice session happens entirely in the **browser** via a WebSocket to Deepgram.
The backend only provides the config — it never touches the audio stream.

### Flow

```
1. User enters topic + name → UI calls POST /agent-config
2. UI receives deepgramConfig (Deepgram Settings payload)
3. UI opens WebSocket: wss://agent.deepgram.com/v1/agent/converse
   - Auth: subprotocol ['token', DEEPGRAM_API_KEY]  ← client-side key
4. On ws.onopen → UI sends JSON.stringify(deepgramConfig)
5. Deepgram confirms with { type: "SettingsApplied" }
6. Agent speaks greeting, conversation begins
7. UI sends raw PCM audio (linear16, 16kHz) as binary frames
8. Deepgram sends binary audio back (linear16, 24kHz) for playback
9. Deepgram sends JSON events for conversation state
10. User clicks End → UI calls POST /transcript with collected messages
11. UI calls POST /generate-linkedin with the transcript text
```

### Audio Format

| Direction | Encoding | Sample Rate |
|---|---|---|
| Mic → Deepgram | linear16 PCM | 16,000 Hz |
| Deepgram → Speaker | linear16 PCM | 24,000 Hz |

Capture mic using Web Audio API `ScriptProcessor` (or `AudioWorkletNode`):
```js
const audioCtx = new AudioContext({ sampleRate: 16000 })
const source = audioCtx.createMediaStreamSource(stream)
const processor = audioCtx.createScriptProcessor(4096, 1, 1)
processor.onaudioprocess = (e) => {
  const float32 = e.inputBuffer.getChannelData(0)
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32768))
  }
  ws.send(int16.buffer)
}
source.connect(processor)
processor.connect(audioCtx.destination)
```

### WebSocket Events (JSON messages from Deepgram)

| Event type | Meaning |
|---|---|
| `Welcome` | Connection established |
| `SettingsApplied` | Config accepted, agent ready |
| `Error` | Config rejected (check payload) |
| `UserStartedSpeaking` | User began talking |
| `AgentThinking` | LLM processing |
| `AgentStartedSpeaking` | TTS audio incoming |
| `AgentAudioDone` | TTS finished |
| `ConversationText` | Transcript line — `{ role: "user"|"assistant", content: "..." }` |
| `History` | Full conversation history on reconnect |

Collect `ConversationText` events into a `messages` array for the `/transcript` call.

### Binary audio playback

Incoming binary frames are raw PCM int16 at 24kHz.
Convert to float32 and play through `AudioContext`:
```js
const int16 = new Int16Array(arrayBuffer)
const float32 = new Float32Array(int16.length)
for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768
const buf = ctx.createBuffer(1, float32.length, 24000)
buf.getChannelData(0).set(float32)
const src = ctx.createBufferSource()
src.buffer = buf
src.connect(ctx.destination)
src.start()
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | Yes | Used for LinkedIn post generation (gpt-4o) and as the LLM provider inside Deepgram |
| `VITE_DEEPGRAM_API_KEY` | Frontend only | Deepgram API key — used by the browser WebSocket directly, never sent to backend |

---

## CORS

The server allows origins:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:5175`

Update `main.py` `allow_origins` for production deployment.
