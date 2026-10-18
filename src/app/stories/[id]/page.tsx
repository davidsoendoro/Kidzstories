import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteStory } from "@/app/actions/stories";
import { BookReader } from "@/components/BookReader";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StatusPoller } from "@/components/StatusPoller";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePages } from "@/lib/story";

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id }, include: { child: true, videos: { orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!story) notFound();

  if (story.status === "generating") {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <StatusPoller url={`/api/stories/${story.id}/status`} />
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-sun border-t-berry" aria-hidden />
        <h1 className="mt-8 text-3xl font-bold">Writing &amp; illustrating {story.child.name}'s story...</h1>
        <p className="mt-3 text-ink/70">This usually takes a minute or two. You can leave this page - we'll keep working.</p>
      </div>
    );
  }

  if (story.status === "failed") {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mt-3 text-ink/70">{story.error ?? "We couldn't finish this story."}</p>
        <Link href={`/stories/new?template=${story.templateId}&child=${story.childId}`} className="btn-primary mt-6">Try again</Link>
      </div>
    );
  }

  const pages = parsePages(story.pages);
  const video = story.videos[0];
  return (
    <div className="container-page py-10">
      <Link href="/dashboard" className="btn-ghost -ml-4">← My stories</Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-bold">{story.title}</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={`/stories/${story.id}/edit`} className="btn-secondary">Edit pages</Link>
          <a href={`/api/stories/${story.id}/pdf`} className="btn-secondary">Download PDF</a>
          <Link href={`/stories/${story.id}/video`} className="btn-secondary">{video ? "Watch video" : "Make a video"}</Link>
          <Link href={`/stories/${story.id}/print`} className="btn-primary">Order a printed book</Link>
        </div>
      </div>
      <div className="mt-8">
        <BookReader storyId={story.id} title={story.title} pages={pages.map((p) => p.text)} />
      </div>
      <form action={deleteStory.bind(null, story.id)} className="mt-10 text-right">
        <ConfirmButton message="Delete this story, its illustrations and videos permanently?">Delete story</ConfirmButton>
      </form>
    </div>
  );
}
