import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const playlistsListSchema = z.object({
  channelId: z.string().optional().describe("Return playlists of this channel"),
  id: z.string().optional().describe("Comma-separated playlist IDs"),
  part: z.string().default("snippet,contentDetails").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5),
  pageToken: z.string().optional(),
  hl: z.string().optional().describe("Language for localized metadata"),
});

export type PlaylistsListParams = z.infer<typeof playlistsListSchema>;

export async function playlistsList(params: PlaylistsListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.playlists.list({
    part: params.part.split(",") as any,
    channelId: params.channelId,
    id: params.id ? params.id.split(",") : undefined,
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
