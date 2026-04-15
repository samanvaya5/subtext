import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const activitiesListSchema = z.object({
  channelId: z.string().describe("Channel ID to fetch activities for"),
  part: z.string().default("snippet,contentDetails").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5),
  pageToken: z.string().optional(),
  publishedAfter: z.string().optional().describe("RFC 3339/ISO 8601 datetime"),
  publishedBefore: z.string().optional().describe("RFC 3339/ISO 8601 datetime"),
  regionCode: z.string().optional().describe("ISO 3166-1 alpha-2 country code"),
});

export type ActivitiesListParams = z.infer<typeof activitiesListSchema>;

export async function activitiesList(params: ActivitiesListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.activities.list({
    part: params.part.split(",") as any,
    channelId: params.channelId,
    maxResults: params.maxResults,
    pageToken: params.pageToken,
    publishedAfter: params.publishedAfter,
    publishedBefore: params.publishedBefore,
    regionCode: params.regionCode,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    prevPageToken: resp.data.prevPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
