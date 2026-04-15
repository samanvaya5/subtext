import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const playlistItemsListSchema = z.object({
  playlistId: z.string().optional().describe("Playlist ID to retrieve items from"),
  id: z.string().optional().describe("Comma-separated playlist item IDs"),
  part: z.string().default("snippet,contentDetails").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5),
  pageToken: z.string().optional(),
  videoId: z.string().optional().describe("Only return items containing this video"),
});

export type PlaylistItemsListParams = z.infer<typeof playlistItemsListSchema>;

export async function playlistItemsList(params: PlaylistItemsListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.playlistItems.list({
    part: params.part.split(",") as any,
    playlistId: params.playlistId,
    id: params.id ? params.id.split(",") : undefined,
    maxResults: params.maxResults,
    pageToken: params.pageToken,
    videoId: params.videoId,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    prevPageToken: resp.data.prevPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
