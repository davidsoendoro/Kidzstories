import Link from "next/link";
import { notFound } from "next/navigation";
import { createVideo } from "@/app/actions/stories";
import { StatusPoller } from "@/components/StatusPoller";
import { SubmitButton } from "@/components/SubmitButton";
import { VideoPlayer } from "@/components/VideoPlayer";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Story video" };

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id }, include: { videos: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!story) notFound();
  const video = story.videos[0];

  return (
    <div className="container-page max-w-4xl py-10">
      <Link href={`/stories/${id}`} className="btn-ghost -ml-4">← Back to the book</Link>
      <h1 className="mt-2 text-4xl font-bold">{story.title}: the video</h1>
      <p className="mt-2 text-ink/70">A short animated version of the story, narrated page by page.</p>
      <div className="mt-8">
        {video?.status === "generating" && (
          <div className="card text-center">
            <StatusPoller url={`/api/videos/${video.id}`} />
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sun border-t-berry" aria-hidden />
            <p className="mt-4 font-semibold">Animating your story...</p>
          </div>
        )}
        {video?.status === "ready" && video.mimeType && <VideoPlayer videoId={video.id} storyId={id} mime={video.mimeType} />}
        {video?.status === "failed" && <p className="card text-red-800">{video.error}</p>}
        {(!video || video.status === "failed") && (
          <form action={createVideo.bind(null, id)} className="card mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold">Turn this story into a short video</p>
              <p className="text-sm text-ink/60">Uses 1 video credit · you have {user.videoCredits}.</p>
            </div>
            <SubmitButton pendingText="Starting...">{user.videoCredits > 0 ? "Make the video" : "Get a video credit"}</SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
