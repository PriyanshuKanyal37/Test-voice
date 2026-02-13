/**
 * Request payload for generating agent configuration
 */
export interface AgentConfigRequest {
  topic: string;
  userName?: string;
  topic_title?: string;
  global_context?: string;
  why_this_matters?: string;
  key_questions?: string[];
}

/**
 * Deepgram configuration for voice agent
 */
export interface DeepgramConfig {
  type: 'Settings';
  audio: {
    input: {
      encoding: 'linear16';
      sample_rate: 16000;
    };
    output: {
      encoding: 'linear16';
      sample_rate: 24000;
      container: 'none';
    };
  };
  agent: {
    language: 'en';
    greeting: string;
    listen: {
      provider: {
        type: 'deepgram';
        model: 'nova-3';
      };
    };
    think: {
      provider: {
        type: 'open_ai';
        model: 'gpt-4o-mini';
      };
      prompt: string;
    };
    speak: {
      provider: {
        type: 'deepgram';
        model: 'aura-2-thalia-en';
      };
    };
  };
}

/**
 * Response from agent configuration endpoint
 */
export interface AgentConfigResponse {
  systemPrompt: string;
  topicTitle: string;
  userName: string;
  deepgramConfig: DeepgramConfig;
}
