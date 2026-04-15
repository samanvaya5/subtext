import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const subscriptionsListSchema = z.object({
  channelId: z.string().optional().describe("Channel ID to fetch subscriptions for"),
  id: z.string().optional().describe("Comma-separated subscription IDs"),
  forChannelId: z.string().optional().describe("Only return subscriptions matching these channel IDs"),
  part: z.string().default("snippet,contentDetails").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5),
  order: z.enum(["alphabetical", "relevance", "unread"]).default("relevance"),
  pageToken: z.string().optional(),
});

export type SubscriptionsListParams = z.infer<typeof subscriptionsListSchema>;

export async function subscriptionsList(params: SubscriptionsListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.subscriptions.list({
    part: params.part.split(",") as any,
    channelId: params.channelId,
    id: params.id ? params.id.split(",") : undefined,
    forChannelId: params.forChannelId,
    maxResults: params.maxResults,
    order: params.order,
    pageToken: params.pageToken,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    prevPageToken: resp.data.prevPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
