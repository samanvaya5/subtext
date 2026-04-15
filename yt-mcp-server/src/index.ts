#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getTranscript, getTranscriptSchema } from "./tools/get-transcript.js";
import { getTranscriptsBulk, getTranscriptsBulkSchema } from "./tools/get-transcripts-bulk.js";
import { listChannelVideos, listChannelVideosSchema } from "./tools/list-channel-videos.js";
import { getChannelTranscripts, getChannelTranscriptsSchema } from "./tools/get-channel-transcripts.js";
import { search, searchSchema } from "./tools/search.js";
import { videosList, videosListSchema } from "./tools/videos.js";
import { channelsList, channelsListSchema } from "./tools/channels.js";
import { playlistsList, playlistsListSchema } from "./tools/playlists.js";
import { playlistItemsList, playlistItemsListSchema } from "./tools/playlist-items.js";
import { commentThreadsList, commentThreadsListSchema } from "./tools/comment-threads.js";
import { commentsList, commentsListSchema } from "./tools/comments.js";
import { activitiesList, activitiesListSchema } from "./tools/activities.js";
import { subscriptionsList, subscriptionsListSchema } from "./tools/subscriptions.js";
import { videoCategoriesList, videoCategoriesListSchema } from "./tools/video-categories.js";
import { z, ZodType } from "zod";

const server = new McpServer({
  name: "subtext-yt",
  version: "1.0.0",
});

type AnySchema = z.ZodTypeAny;

function toolError(message: string) {
  return { content: [{ type: "text" as const, text: JSON.stringify({ error: message }) }], isError: true as const };
}

function wrapHandler<T extends AnySchema>(handler: (args: z.infer<T>) => Promise<any>) {
  return async (args: z.infer<T>) => {
    try {
      const result = await handler(args);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Tool error: ${message}`);
      return toolError(message);
    }
  };
}

function reg(
  name: string,
  description: string,
  schema: AnySchema,
  handler: (args: any) => Promise<any>
) {
  server.registerTool(name, {
    description,
    inputSchema: schema,
  }, wrapHandler(handler) as any);
}

reg(
  "youtube_get_transcript",
  "Fetch transcript for a single YouTube video. Returns plain text transcript by default (most token-efficient). Uses InnerTube API for transcript extraction.",
  getTranscriptSchema,
  getTranscript
);

reg(
  "youtube_get_transcripts_bulk",
  "Fetch transcripts for multiple YouTube videos (1-50). Uses concurrent requests with rate limiting (3-5s delays). Returns partial results on failures.",
  getTranscriptsBulkSchema,
  getTranscriptsBulk
);

reg(
  "youtube_list_channel_videos",
  "List videos uploaded by a YouTube channel in the last N days. Uses YouTube Data API v3. Provide either channelId or handle.",
  listChannelVideosSchema,
  listChannelVideos
);

reg(
  "youtube_get_channel_transcripts",
  "Fetch transcripts for ALL videos uploaded by a channel in the last N days. This is the main orchestrator tool that combines video discovery (YouTube Data API) with bulk transcript fetching (youtubei.js). Returns partial results on failures. Supports concurrent fetching with rate limiting.",
  getChannelTranscriptsSchema,
  getChannelTranscripts
);

reg(
  "youtube_search",
  "Search YouTube for videos, channels, and playlists. Uses YouTube Data API v3 search.list (costs 100 quota units per call). Supports advanced filters like date range, region, duration, event type, and more.",
  searchSchema,
  search
);

reg(
  "youtube_videos_list",
  "Get details for YouTube videos by ID or most popular chart. Uses YouTube Data API v3 videos.list (1 quota unit). Returns snippet, statistics, and content details by default.",
  videosListSchema,
  videosList
);

reg(
  "youtube_channels_list",
  "Get details for YouTube channels by ID, handle, or username. Uses YouTube Data API v3 channels.list (1 quota unit). Returns snippet, statistics, and content details by default.",
  channelsListSchema,
  channelsList
);

reg(
  "youtube_playlists_list",
  "List playlists for a channel or by playlist IDs. Uses YouTube Data API v3 playlists.list (1 quota unit). Returns snippet and content details by default.",
  playlistsListSchema,
  playlistsList
);

reg(
  "youtube_playlist_items_list",
  "List items in a YouTube playlist. Uses YouTube Data API v3 playlistItems.list (1 quota unit). Returns snippet and content details by default.",
  playlistItemsListSchema,
  playlistItemsList
);

reg(
  "youtube_comment_threads_list",
  "List comment threads for a video or channel. Uses YouTube Data API v3 commentThreads.list (1 quota unit). Supports filtering by search terms and ordering by time or relevance.",
  commentThreadsListSchema,
  commentThreadsList
);

reg(
  "youtube_comments_list",
  "List comments or replies by parent comment ID or comment IDs. Uses YouTube Data API v3 comments.list (1 quota unit).",
  commentsListSchema,
  commentsList
);

reg(
  "youtube_activities_list",
  "List channel activities (uploads, likes, subscriptions, etc.). Uses YouTube Data API v3 activities.list (1 quota unit). Filter by date range and region.",
  activitiesListSchema,
  activitiesList
);

reg(
  "youtube_subscriptions_list",
  "List channel subscriptions. Uses YouTube Data API v3 subscriptions.list (1 quota unit). Works with API key for public channels only.",
  subscriptionsListSchema,
  subscriptionsList
);

reg(
  "youtube_video_categories",
  "List video categories available in a region. Uses YouTube Data API v3 videoCategories.list (1 quota unit).",
  videoCategoriesListSchema,
  videoCategoriesList
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("yt-mcp-server running on stdio");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
