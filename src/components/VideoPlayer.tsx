"use client";

import { useEffect, useState } from "react";

type Scene = { page: number; text: string; durationMs: number };
type Manifest = { kind: string; title: string; scenes: Scene[] };

/** Plays either a real video file or a storyboard manifest (animated illustrations + captions). */
export function VideoPlayer({ videoId, storyId, mime }: { videoId: string; storyId: string; mime: string }) {
  const src = `/api/videos/${videoId}`;
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [scene, setScene] = useState(-1);
  const isFile = mime.startsWith("video/");

  useEffect(() => {
    if (isFile) return;
    fetch(src).then((r) => r.json()).then(setManifest).catch(() => setManifest(null));
  }, [src, isFile]);

  useEffect(() => {
    if (!manifest || scene < 0 || scene >= manifest.scenes.length) return;
    const t = setTimeout(() => setScene((s) => s + 1), manifest.scenes[scene].durationMs);
    return () => clearTimeout(t);
  }, [manifest, scene]);

  if (isFile) return <video src={src} controls className="aspect-video w-full rounded-3xl bg-black" />;
  if (!manifest) return <div className="aspect-video w-full animate-pulse rounded-3xl bg-ink/10" />;

  const current = manifest.scenes[scene];
  const finished = scene >= manifest.scenes.length;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-ink">
      {current && (
        <div key={scene} className="absolute inset-0" style={{ ["--scene-duration" as string]: `${current.durationMs}ms` }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated illustration */}
          <img src={`/api/stories/${storyId}/pages/${current.page - 1}`} alt="" className="animate-kenburns h-full w-full object-cover" />
          <p className="animate-caption absolute inset-x-6 bottom-6 rounded-2xl bg-black/55 px-5 py-3 text-center font-display text-lg text-white sm:text-xl">{current.text}</p>
        </div>
      )}
      {(scene < 0 || finished) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/80 text-center text-white">
          <p className="px-6 font-display text-2xl font-bold sm:text-3xl">{finished ? "The End" : manifest.title}</p>
          <button className="btn-primary" onClick={() => setScene(0)}>{finished ? "Watch again" : "▶ Play"}</button>
        </div>
      )}
      {current && (
        <div className="absolute inset-x-0 top-0 h-1 bg-white/20">
          <div className="h-full bg-sun transition-all" style={{ width: `${((scene + 1) / manifest.scenes.length) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
