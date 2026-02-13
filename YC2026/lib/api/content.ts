import type { LinkedInGenerationRequest, LinkedInGenerationResponse } from '@/lib/types/content';

/**
 * Generate LinkedIn post from transcript
 * Calls the server-side API route which proxies to the external API
 * @param request - LinkedIn generation request
 * @returns Generated LinkedIn post content
 */
export async function generateLinkedInPost(
  request: LinkedInGenerationRequest
): Promise<string> {
  const response = await fetch('/api/content/linkedin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `LinkedIn generation failed: ${response.status}`);
  }

  const data: LinkedInGenerationResponse = await response.json();
  return data.linkedin;
}
