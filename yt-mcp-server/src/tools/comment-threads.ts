import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const commentThreadsListSchema = z.object({
  videoId: z.string().optional().describe("Return comment threads for this video"),
  allThreadsRelatedToChannelId: z.string().optional().describe("Return all comment threads for this channel"),
  id: z.string().optional().describe("Comma-separated comment thread IDs"),
  part: z.string().default("snippet,replies").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(100).default(20),
  order: z.enum(["time", "relevance"]).default("time").describe("Comment order"),
  pageToken: z.string().optional(),
  searchTerms: z.string().optional().describe("Filter comments containing these terms"),
  textFormat: z.enum(["html", "plainText"]).default("plainText"),
});

export type CommentThreadsListParams = z.infer<typeof commentThreadsListSchema>;

export async function commentThreadsList(params: CommentThreadsListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.commentThreads.list({
    part: params.part.split(",") as any,
    videoId: params.videoId,
    allThreadsRelatedToChannelId: params.allThreadsRelatedToChannelId,
    id: params.id ? params.id.split(",") : undefined,
    maxResults: params.maxResults,
    order: params.order,
    pageToken: params.pageToken,
    searchTerms: params.searchTerms,
    textFormat: params.textFormat,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
