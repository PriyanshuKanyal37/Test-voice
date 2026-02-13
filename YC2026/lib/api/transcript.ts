import type { TranscriptRequest, TranscriptResponse } from '@/lib/types/transcript';

const BASE_URL = ''; // Relative path for Next.js API route

/**
 * Format transcript from conversation messages
 * @param request - Transcript request with messages
 * @returns Formatted transcript response
 */
export async function formatTranscript(
  request: TranscriptRequest
): Promise<TranscriptResponse> {
  const response = await fetch('/api/agent/transcript', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Transcript formatting failed: ${response.status}`);
  }

  return await response.json();
}
