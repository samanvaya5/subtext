import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const commentsListSchema = z.object({
  parentId: z.string().optional().describe("Comment ID to retrieve replies for"),
  id: z.string().optional().describe("Comma-separated comment IDs"),
  part: z.string().default("snippet").describe("Resource parts (comma-separated)"),
  maxResults: z.number().min(1).max(100).default(20),
  pageToken: z.string().optional(),
  textFormat: z.enum(["html", "plainText"]).default("plainText"),
});

export type CommentsListParams = z.infer<typeof commentsListSchema>;

export async function commentsList(params: CommentsListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.comments.list({
    part: params.part.split(",") as any,
    parentId: params.parentId,
    id: params.id ? params.id.split(",") : undefined,
    maxResults: params.maxResults,
    pageToken: params.pageToken,
    textFormat: params.textFormat,
  });
  return {
    nextPageToken: resp.data.nextPageToken,
    pageInfo: resp.data.pageInfo,
    items: resp.data.items,
  };
}
