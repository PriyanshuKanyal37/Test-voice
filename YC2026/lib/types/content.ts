/**
 * Request payload for LinkedIn post generation
 */
export interface LinkedInGenerationRequest {
  topic: string;
  userName?: string;
  transcript: string;
}

/**
 * Response from LinkedIn generation endpoint
 */
export interface LinkedInGenerationResponse {
  linkedin: string;
}

/**
 * Content asset types
 */
export type ContentPlatform = 'linkedin' | 'twitter' | 'newsletter' | 'carousel' | 'video';

/**
 * Content asset status
 */
export type ContentStatus = 'ready' | 'generating' | 'error';

/**
 * Generated content asset
 */
export interface ContentAsset {
  platform: ContentPlatform;
  status: ContentStatus;
  content: string;
  error?: string;
}
