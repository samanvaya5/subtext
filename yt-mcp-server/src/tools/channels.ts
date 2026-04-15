import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const channelsListSchema = z.object({
  id: z.string().optional().describe("Comma-separated channel IDs"),
  forHandle: z.string().optional().describe("Channel handle (e.g. '@MrBeast')"),
  forUsername: z.string().optional().describe("YouTube username"),
  part: z.string().default("snippet,statistics,contentDetails").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5),
  pageToken: z.string().optional(),
  hl: z.string().optional().describe("Language for localized metadata"),
});

export type ChannelsListParams = z.infer<typeof channelsListSchema>;

export async function channelsList(params: ChannelsListParams) {
  const youtube = requireYoutubeClient();

  const resp = await youtube.channels.list({
    part: params.part.split(",") as any,
    id: params.id ? params.id.split(",") : undefined,
    forHandle: params.forHandle,
    forUsername: params.forUsername,
    maxResults: params.maxResults,
    pageToken: params.pageToken,
    hl: params.hl,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    prevPageToken: resp.data.prevPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
