import "server-only";

export interface VideoScene {
  page: number;
  text: string;
  illustrationKey?: string;
  durationMs: number;
}

export interface VideoRequest {
  storyTitle: string;
  scenes: VideoScene[];
}

export interface VideoResult {
  data: Buffer;
  mime: string;
}

export interface VideoProvider {
  name: string;
  render(req: VideoRequest): Promise<VideoResult>;
}

/**
 * Offline provider: produces a storyboard manifest the in-app player animates
 * (Ken Burns pans + captions, ~45-60s). A real provider returns video/mp4 and
 * the player streams it instead.
 */
export const storyboardVideoProvider: VideoProvider = {
  name: "storyboard",
  async render(req) {
    const manifest = { kind: "kidzstories-storyboard", version: 1, title: req.storyTitle, scenes: req.scenes };
    return { data: Buffer.from(JSON.stringify(manifest)), mime: "application/vnd.kidzstories.storyboard+json" };
  },
};

export function getVideoProvider(): VideoProvider {
  return storyboardVideoProvider;
}

export function readingTimeMs(text: string) {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.min(Math.max(words * 380, 4000), 9000);
}
