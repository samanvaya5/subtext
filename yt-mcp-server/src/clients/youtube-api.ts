import { google } from "googleapis";
import { youtube_v3 } from "googleapis";

let _youtube: youtube_v3.Youtube | null = null;

export function getYoutubeClient(): youtube_v3.Youtube | null {
  if (_youtube) return _youtube;
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;
  _youtube = google.youtube({ version: "v3", auth: apiKey });
  return _youtube;
}

export function requireYoutubeClient(): youtube_v3.Youtube {
  const client = getYoutubeClient();
  if (!client) {
    throw new Error("YOUTUBE_API_KEY is required for this operation. Get one at https://console.cloud.google.com/apis/credentials");
  }
  return client;
}

export type YouTube = youtube_v3.Youtube;
