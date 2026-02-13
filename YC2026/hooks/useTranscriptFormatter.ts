import { useMutation } from '@tanstack/react-query';
import { formatTranscript } from '@/lib/api/transcript';
import type { TranscriptRequest } from '@/lib/types/transcript';

export function useTranscriptFormatter() {
  return useMutation({
    mutationFn: (request: TranscriptRequest) => formatTranscript(request),
    onError: (error) => {
      console.error('Failed to format transcript:', error);
    },
  });
}
