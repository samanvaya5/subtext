import { z } from "zod";
import { requireYoutubeClient } from "../clients/youtube-api.js";

export const videoCategoriesListSchema = z.object({
  regionCode: z.string().optional().describe("ISO 3166-1 alpha-2 country code"),
  id: z.string().optional().describe("Comma-separated video category IDs"),
  hl: z.string().optional().describe("Language for text values. Default: en_US"),
});

export type VideoCategoriesListParams = z.infer<typeof videoCategoriesListSchema>;

export async function videoCategoriesList(params: VideoCategoriesListParams) {
  const youtube = requireYoutubeClient();
  const resp = await youtube.videoCategories.list({
    part: ["snippet"],
    regionCode: params.regionCode,
    id: params.id ? params.id.split(",") : undefined,
    hl: params.hl,
  });
  return {
    items: resp.data.items,
  };
}
