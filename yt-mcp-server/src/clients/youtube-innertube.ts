import { Innertube } from "youtubei.js";

let _innertube: Innertube | null = null;

export async function getInnertube(): Promise<Innertube> {
  if (_innertube) return _innertube;
  _innertube = await Innertube.create({ generate_session_locally: true });
  return _innertube;
}
