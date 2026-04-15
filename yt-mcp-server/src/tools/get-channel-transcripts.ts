import { z } from "zod";
import pLimit from "p-limit";
import { requireYoutubeClient } from "../clients/youtube-api.js";
import { daysAgo } from "../utils/date-utils.js";
import { randomDelay, withRetry } from "../utils/rate-limiter.js";
import { fetchTranscript } from "../utils/transcript-fetcher.js";
import { formatTranscriptPlain, formatTranscriptWithTimestamps, TranscriptSegment } from "../utils/transcript-formatter.js";

export const getChannelTranscriptsSchema = z.object({
  channelId: z.string().optional().describe("YouTube channel ID (UC...)"),
  handle: z.string().optional().describe("Channel handle (e.g. '@MrBeast')"),
  days: z.number().min(1).max(90).default(7).describe("Days to look back. Default: 7"),
  maxVideos: z.number().min(1).max(200).default(50).describe("Max videos to process. Default: 50"),
  concurrency: z.number().min(1).max(5).default(3).describe("Concurrent transcript fetches. Default: 3"),
  includeTimestamps: z.boolean().default(false).describe("Include timestamps in transcripts"),
});

export type GetChannelTranscriptsParams = z.infer<typeof getChannelTranscriptsSchema>;

export async function getChannelTranscripts(params: GetChannelTranscriptsParams) {
  const youtube = requireYoutubeClient();

  let channelId = params.channelId;
  if (!channelId && params.handle) {
    const handle = params.handle.startsWith("@") ? params.handle : `@${params.handle}`;
    const resp = await youtube.channels.list({ forHandle: handle, part: ["id"] });
    if (!resp.data.items?.[0]?.id) throw new Error(`Channel not found: ${params.handle}`);
    channelId = resp.data.items[0].id;
  }
  if (!channelId) throw new Error("Provide either channelId or handle");

  const channelResp = await youtube.channels.list({
    id: [channelId],
    part: ["snippet", "contentDetails"],
  });
  const channel = channelResp.data.items?.[0];
  if (!channel) throw new Error(`Channel not found: ${channelId}`);

  const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("Could not find uploads playlist");

  const cutoff = daysAgo(params.days);
  const videoEntries: { videoId: string; title: string; publishedAt: string }[] = [];
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
        videoEntries.push({
          videoId: item.contentDetails?.videoId ?? item.snippet?.resourceId?.videoId ?? "",
          title: item.snippet?.title ?? "Unknown",
          publishedAt: item.snippet?.publishedAt ?? "",
        });
        if (videoEntries.length >= params.maxVideos) break;
      }
    }
    if (videoEntries.length >= params.maxVideos) break;
    pageToken = resp.data.nextPageToken ?? undefined;
  } while (pageToken);

  const limit = pLimit(params.concurrency);
  const transcripts: any[] = [];
  const failed: any[] = [];

  const tasks = videoEntries.map((entry, index) =>
    limit(async () => {
      if (index > 0) await randomDelay();
      try {
        const result = await withRetry(async () => {
          const rawSegments = await fetchTranscript(entry.videoId);
          const segments: TranscriptSegment[] = rawSegments.map((s) => ({
            text: s.text,
            startMs: Math.round(s.offset * 1000),
            endMs: Math.round((s.offset + s.duration) * 1000),
          }));
          return params.includeTimestamps
            ? formatTranscriptWithTimestamps(segments)
            : formatTranscriptPlain(segments);
        });
        transcripts.push({
          videoId: entry.videoId,
          title: entry.title,
          publishedAt: entry.publishedAt,
          transcript: result,
        });
      } catch (err) {
        failed.push({
          videoId: entry.videoId,
          title: entry.title,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  await Promise.all(tasks);

  return {
    channelName: channel.snippet?.title,
    channelId: channel.id,
    dateRange: { from: cutoff.toISOString(), to: new Date().toISOString() },
    totalVideos: videoEntries.length,
    fetched: transcripts.length,
    failed: failed.length,
    transcripts,
    errors: failed,
  };
}
