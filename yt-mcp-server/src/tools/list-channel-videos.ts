import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";
import { daysAgo } from "../utils/date-utils.js";

export const listChannelVideosSchema = z.object({
  channelId: z.string().optional().describe("YouTube channel ID (UC...)"),
  handle: z.string().optional().describe("Channel handle (e.g. '@MrBeast' or 'MrBeast')"),
  days: z.number().min(1).max(365).default(7).describe("Number of days to look back. Default: 7"),
  maxResults: z.number().min(1).max(500).default(50).describe("Max videos to return. Default: 50"),
});

export type ListChannelVideosParams = z.infer<typeof listChannelVideosSchema>;

export async function listChannelVideos(params: ListChannelVideosParams) {
  const youtube = requireYoutubeClient();

  let channelId = params.channelId;
  if (!channelId && params.handle) {
    const handle = params.handle.startsWith("@") ? params.handle : `@${params.handle}`;
    const resp = await youtube.channels.list({
      forHandle: handle,
      part: ["id", "snippet", "contentDetails"],
    });
    const ch = resp.data.items?.[0];
    if (!ch?.id) throw new Error(`Channel not found for handle: ${params.handle}`);
    channelId = ch.id;
  }
  if (!channelId) throw new Error("Provide either channelId or handle");

  const channelResp = await youtube.channels.list({
    id: [channelId],
    part: ["snippet", "contentDetails"],
  });
  const channel = channelResp.data.items?.[0];
  if (!channel) throw new Error(`Channel not found: ${channelId}`);

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist for this channel");

  const cutoff = daysAgo(params.days);
  const videos: any[] = [];
  let pageToken: string | undefined;

  do {
    const resp = await youtube.playlistItems.list({
      playlistId: uploadsPlaylistId,
      part: ["snippet", "contentDetails"],
      maxResults: 50,
      pageToken,
    });

    for (const item of resp.data.items ?? []) {
      const publishedAt = new Date(item.snippet?.publishedAt ?? 0);
      if (publishedAt >= cutoff) {
        videos.push({
          videoId: item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId,
          title: item.snippet?.title,
          publishedAt: item.snippet?.publishedAt,
          channelTitle: item.snippet?.channelTitle,
          description: item.snippet?.description,
          thumbnails: item.snippet?.thumbnails,
        });
        if (videos.length >= params.maxResults) break;
      }
    }

    if (videos.length >= params.maxResults) break;
    const oldestInPage = resp.data.items?.[resp.data.items.length - 1];
    if (oldestInPage) {
      const oldestDate = new Date(oldestInPage.snippet?.publishedAt ?? 0);
      if (oldestDate < cutoff) break;
    }
    pageToken = resp.data.nextPageToken ?? undefined;
  } while (pageToken);

  return {
    channelName: channel.snippet?.title,
    channelId: channel.id,
    dateRange: { from: cutoff.toISOString(), to: new Date().toISOString() },
    totalVideos: videos.length,
    videos,
  };
}
