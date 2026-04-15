const INNERTUBE_PLAYER_URL = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";
const ANDROID_CLIENT_VERSION = "20.10.38";
const ANDROID_USER_AGENT = `com.google.android.youtube/${ANDROID_CLIENT_VERSION} (Linux; U; Android 14)`;

interface CaptionTrack {
  baseUrl: string;
  languageCode: string;
  name: { simpleText: string };
}

interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

export async function fetchTranscript(
  videoId: string,
  lang?: string
): Promise<TranscriptSegment[]> {
  const captionTracks = await getCaptionTracks(videoId);
  const track = selectTrack(captionTracks, lang, videoId);
  const xml = await fetchCaptionXml(track.baseUrl);
  return parseTranscriptXml(xml);
}

async function getCaptionTracks(videoId: string): Promise<CaptionTrack[]> {
  const resp = await fetch(INNERTUBE_PLAYER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": ANDROID_USER_AGENT,
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion: ANDROID_CLIENT_VERSION,
        },
      },
      videoId,
    }),
  });

  if (!resp.ok) {
    throw new Error(`InnerTube player request failed: ${resp.status}`);
  }

  const data = await resp.json();

  if (data.playabilityStatus?.status === "ERROR") {
    throw new Error(`Video unavailable: ${data.playabilityStatus.reason ?? "unknown"}`);
  }

  const tracks =
    data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!Array.isArray(tracks) || tracks.length === 0) {
    throw new Error("No captions available for this video");
  }

  return tracks;
}

function selectTrack(
  tracks: CaptionTrack[],
  lang: string | undefined,
  videoId: string
): CaptionTrack {
  if (lang) {
    const match = tracks.find((t) => t.languageCode === lang);
    if (!match) {
      const available = tracks.map((t) => t.languageCode);
      throw new Error(
        `No captions in '${lang}'. Available: ${available.join(", ")}`
      );
    }
    return match;
  }
  return tracks.find((t) => t.languageCode === "en") ?? tracks[0];
}

async function fetchCaptionXml(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Caption fetch failed: ${resp.status}`);
  }
  return resp.text();
}

function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const regex = /<text\s+start="([^"]*)"\s+dur="([^"]*)"(?:\s+\w+="[^"]*")*>([^<]*)<\/text>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    segments.push({
      offset: parseFloat(match[1]),
      duration: parseFloat(match[2]),
      text: decodeHTMLEntities(match[3]),
    });
  }

  if (segments.length === 0) {
    const srvRegex = /<p\s+t="([^"]*)"\s+d="([^"]*)"[^>]*>(.*?)<\/p>/gs;
    while ((match = srvRegex.exec(xml)) !== null) {
      const raw = match[3].replace(/<[^>]+>/g, "");
      segments.push({
        offset: parseInt(match[1], 10) / 1000,
        duration: parseInt(match[2], 10) / 1000,
        text: decodeHTMLEntities(raw),
      });
    }
  }

  return segments;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\n/g, " ");
}
