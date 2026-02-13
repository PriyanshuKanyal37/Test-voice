/**
 * Deepgram Voice Agent types
 * Note: DeepgramConfig is exported from ./agent.ts to avoid duplication
 */

export interface DeepgramMessage {
  type: string;
  [key: string]: unknown;
}

export interface ConversationTextEvent {
  type: 'ConversationText';
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentAudioDoneEvent {
  type: 'AgentAudioDone';
}

export interface UserStartedSpeakingEvent {
  type: 'UserStartedSpeaking';
}

export interface AgentStartedSpeakingEvent {
  type: 'AgentStartedSpeaking';
}

export interface AgentThinkingEvent {
  type: 'AgentThinking';
}

export type DeepgramEvent =
  | ConversationTextEvent
  | AgentAudioDoneEvent
  | UserStartedSpeakingEvent
  | AgentStartedSpeakingEvent
  | AgentThinkingEvent
  | DeepgramMessage;

export interface VoiceAgentState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  error: string | null;
}
