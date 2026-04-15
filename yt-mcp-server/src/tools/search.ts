import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const searchSchema = z.object({
  q: z.string().optional().describe("Search query. Supports NOT (-) and OR (|) operators"),
  type: z.string().default("video,channel,playlist").describe("Resource types: video, channel, playlist (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5).describe("Max results (1-50). Default: 5"),
  order: z.enum(["date", "rating", "relevance", "title", "videoCount", "viewCount"]).default("relevance").describe("Sort order"),
  channelId: z.string().optional().describe("Restrict to resources from this channel"),
  publishedAfter: z.string().optional().describe("RFC 3339 datetime. Only resources after this time"),
  publishedBefore: z.string().optional().describe("RFC 3339 datetime. Only resources before this time"),
  regionCode: z.string().optional().describe("ISO 3166-1 alpha-2 country code"),
  videoDuration: z.enum(["any", "long", "medium", "short"]).optional().describe("Filter by duration (type=video only)"),
  eventType: z.enum(["completed", "live", "upcoming"]).optional().describe("Filter by event type (type=video only)"),
  safeSearch: z.enum(["moderate", "none", "strict"]).default("moderate"),
  relevanceLanguage: z.string().optional().describe("ISO 639-1 language code"),
  videoCategoryId: z.string().optional().describe("Filter by video category (type=video only)"),
  videoCaption: z.enum(["any", "closedCaption", "none"]).optional().describe("Filter by caption availability (type=video only)"),
  videoDefinition: z.enum(["any", "high", "standard"]).optional().describe("HD vs SD (type=video only)"),
  videoLicense: z.enum(["any", "creativeCommon", "youtube"]).optional().describe("Filter by license (type=video only)"),
  pageToken: z.string().optional().describe("Page token for pagination"),
});

export type SearchParams = z.infer<typeof searchSchema>;

export async function search(params: SearchParams) {
  const youtube = requireYoutubeClient();

  const resp = await youtube.search.list({
    part: ["snippet"],
    q: params.q,
    type: params.type ? [params.type] : undefined,
    maxResults: params.maxResults,
    order: params.order,
    channelId: params.channelId,
    publishedAfter: params.publishedAfter,
    publishedBefore: params.publishedBefore,
    regionCode: params.regionCode,
    videoDuration: params.videoDuration,
    eventType: params.eventType,
    safeSearch: params.safeSearch,
    relevanceLanguage: params.relevanceLanguage,
    videoCategoryId: params.videoCategoryId,
    videoCaption: params.videoCaption,
    videoDefinition: params.videoDefinition,
    videoLicense: params.videoLicense,
    pageToken: params.pageToken,
  });
  return {
    totalResults: resp.data.pageInfo?.totalResults,
    resultsPerPage: resp.data.pageInfo?.resultsPerPage,
    nextPageToken: resp.data.nextPageToken,
    prevPageToken: resp.data.prevPageToken,
    items: resp.data.items?.map((item) => ({
      kind: item.kind,
      etag: item.etag,
      id: item.id,
      snippet: item.snippet,
    })),
  };
}
