import { useQuery } from '@tanstack/react-query';
import { discoverTrendingTopics } from '@/lib/api/trending';
import type { ResearchResult } from '@/lib/types/trending';

interface UseTrendingTopicsOptions {
  keywords: string;
  enabled?: boolean;
}

export function useTrendingTopics({ keywords, enabled = true }: UseTrendingTopicsOptions) {
  return useQuery<ResearchResult, Error>({
    queryKey: ['trending-topics', keywords],
    queryFn: () => discoverTrendingTopics(keywords),
    enabled: enabled && keywords.length > 0,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 1, // Only retry once since this API is slow
    retryDelay: 3000, // Wait 3 seconds before retry
    // Note: This API can take 5-15 seconds, sometimes longer
  });
}
