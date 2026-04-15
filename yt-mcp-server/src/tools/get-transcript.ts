import { z } from "zod";
import { fetchTranscript } from "../utils/transcript-fetcher.js";
import { formatTranscriptPlain, formatTranscriptWithTimestamps, TranscriptSegment } from "../utils/transcript-formatter.js";

export const getTranscriptSchema = z.object({
  videoId: z.string().describe("YouTube video ID (11 characters)"),
  lang: z.string().optional().describe("Language code for transcript (e.g. 'en', 'es'). Defaults to first available."),
  includeTimestamps: z.boolean().default(false).describe("Include timestamps in output. Defaults to false for token efficiency."),
});

export type GetTranscriptParams = z.infer<typeof getTranscriptSchema>;

export async function getTranscript(params: GetTranscriptParams) {
  const rawSegments = await fetchTranscript(params.videoId, params.lang);

  const segments: TranscriptSegment[] = rawSegments.map((s) => ({
    text: s.text,
    startMs: Math.round(s.offset * 1000),
    endMs: Math.round((s.offset + s.duration) * 1000),
  }));

  const transcript = params.includeTimestamps
    ? formatTranscriptWithTimestamps(segments)
    : formatTranscriptPlain(segments);

  return {
    videoId: params.videoId,
    transcript,
    segmentCount: segments.length,
    language: params.lang ?? "default",
  };
}
