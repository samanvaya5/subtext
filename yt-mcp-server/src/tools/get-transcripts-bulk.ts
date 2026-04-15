import { z } from "zod";
import pLimit from "p-limit";
import { getTranscript } from "./get-transcript.js";
import { randomDelay, withRetry } from "../utils/rate-limiter.js";

export const getTranscriptsBulkSchema = z.object({
  videoIds: z.array(z.string()).min(1).max(50).describe("Array of YouTube video IDs (1-50)"),
  lang: z.string().optional().describe("Language code for transcripts"),
  includeTimestamps: z.boolean().default(false).describe("Include timestamps"),
  concurrency: z.number().min(1).max(5).default(3).describe("Max concurrent requests (1-5). Default: 3"),
});

export type GetTranscriptsBulkParams = z.infer<typeof getTranscriptsBulkSchema>;

export async function getTranscriptsBulk(params: GetTranscriptsBulkParams) {
  const limit = pLimit(params.concurrency);
  const results: any[] = [];
  const failed: any[] = [];

  const tasks = params.videoIds.map((videoId, index) =>
    limit(async () => {
      if (index > 0) await randomDelay();
      try {
        const result = await withRetry(() =>
          getTranscript({ videoId, lang: params.lang, includeTimestamps: params.includeTimestamps })
        );
        results.push(result);
      } catch (err) {
        failed.push({
          videoId,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })
  );

  await Promise.all(tasks);

  return {
    fetched: results.length,
    failed: failed.length,
    transcripts: results,
    errors: failed,
  };
}
