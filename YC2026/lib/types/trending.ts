/**
 * Request payload for discovering trending topics
 */
export interface TrendingTopicsRequest {
  keyword: string;
}

/**
 * Deep research result from Perplexity
 */
export interface ResearchResult {
  title: string;
  deep_context: string;
  key_insights: string[];
  discussion_points: string[];
  sources: string[];
}

/**
 * Full API response structure
 */
export interface ResearchResponse {
  output: ResearchResult;
}
