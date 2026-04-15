import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const videosListSchema = z.object({
  id: z.string().optional().describe("Comma-separated video IDs"),
  chart: z.enum(["mostPopular"]).optional().describe("Retrieve most popular videos chart"),
  part: z.string().default("snippet,statistics,contentDetails").describe("Resource parts to include (comma-separated)"),
  maxResults: z.number().min(1).max(50).default(5).describe("Max results (1-50). Only works with chart. Default: 5"),
  regionCode: z.string().optional().describe("ISO 3166-1 alpha-2 country code (chart only)"),
  videoCategoryId: z.string().optional().describe("Video category ID for chart filter"),
  pageToken: z.string().optional().describe("Page token (chart only)"),
  hl: z.string().optional().describe("Language for localized metadata"),
});

export type VideosListParams = z.infer<typeof videosListSchema>;

export async function videosList(params: VideosListParams) {
  const youtube = requireYoutubeClient();

  const resp = await youtube.videos.list({
    part: params.part.split(",") as any,
    id: params.id ? params.id.split(",") : undefined,
    chart: params.chart,
    maxResults: params.maxResults,
    regionCode: params.regionCode,
    videoCategoryId: params.videoCategoryId,
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
