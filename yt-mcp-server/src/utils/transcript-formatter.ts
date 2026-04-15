export interface TranscriptSegment {
  text: string;
  startMs: number;
  endMs: number;
}

export function formatTranscriptPlain(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => s.text.trim())
    .filter(Boolean)
    .join(" ");
}

export function formatTranscriptWithTimestamps(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => {
      const mm = Math.floor(s.startMs / 60000);
      const ss = Math.floor((s.startMs % 60000) / 1000);
      return `[${mm}:${ss.toString().padStart(2, "0")}] ${s.text.trim()}`;
    })
    .filter((line) => !line.endsWith("] "))
    .join("\n");
}
