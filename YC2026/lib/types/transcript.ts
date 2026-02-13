/**
 * A single message in the transcript
 */
export interface TranscriptMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Request payload for formatting transcript
 */
export interface TranscriptRequest {
  topic?: string;
  userName?: string;
  messages: TranscriptMessage[];
  duration?: number; // Session length in seconds
}

/**
 * Response from transcript formatting endpoint
 */
export interface TranscriptResponse {
  success: boolean;
  topic: string;
  userName: string;
  duration: string; // e.g., "5 min 12 sec"
  transcript: string; // Formatted with speaker labels
  content: {
    linkedin: string;
    twitter: string;
  };
}
