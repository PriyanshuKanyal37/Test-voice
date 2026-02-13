import { useMutation } from '@tanstack/react-query';
import { generateLinkedInPost } from '@/lib/api/content';
import type { LinkedInGenerationRequest } from '@/lib/types/content';

export function useLinkedInGenerator() {
  return useMutation({
    mutationFn: (request: LinkedInGenerationRequest) => generateLinkedInPost(request),
    retry: 2, // GPT-4o can occasionally timeout
    onError: (error) => {
      console.error('Failed to generate LinkedIn post:', error);
    },
  });
}
