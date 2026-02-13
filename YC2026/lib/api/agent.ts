import type { AgentConfigRequest, AgentConfigResponse } from '@/lib/types/agent';

/**
 * Check if the backend is healthy
 * Calls the server-side API route which proxies to the external API
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/agent/health');
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Generate agent configuration for voice interview
 * Calls the server-side API route which proxies to the external API
 * @param request - Agent configuration request
 * @returns Agent configuration with Deepgram config
 */
export async function generateAgentConfig(
  request: AgentConfigRequest
): Promise<AgentConfigResponse> {
  const response = await fetch('/api/agent/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Agent config generation failed: ${response.status}`);
  }

  return await response.json();
}
