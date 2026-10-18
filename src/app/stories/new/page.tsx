import Link from "next/link";
import { StoryWizard } from "@/components/StoryWizard";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "New story" };

export default async function NewStoryPage({ searchParams }: { searchParams: Promise<{ template?: string; child?: string }> }) {
  const user = await requireUser();
  const { template, child } = await searchParams;
  const kids = await db.child.findMany({ where: { userId: user.id }, include: { _count: { select: { photos: true } } }, orderBy: { createdAt: "asc" } });

  return (
    <div className="container-page py-10">
      <h1 className="text-4xl font-bold">Create a story</h1>
      {kids.length === 0 ? (
        <div className="card mt-6 max-w-xl">
          <p>First, add the child who'll star in the story.</p>
          <Link href="/children/new" className="btn-primary mt-4">Add a child</Link>
        </div>
      ) : (
        <>
          {user.storyCredits < 1 && (
            <p className="mt-4 rounded-2xl bg-sun/20 px-4 py-3 text-sm font-semibold ring-1 ring-sun/50">
              You're out of story credits. <Link href="/pricing" className="text-berry underline">Choose a package</Link> to create this story.
            </p>
          )}
          <div className="mt-8">
            <StoryWizard
              kids={kids.map((k) => ({ id: k.id, name: k.name, pronoun: k.pronoun, photoCount: k._count.photos }))}
              initialTemplate={template}
              initialChild={child}
              credits={user.storyCredits}
            />
          </div>
        </>
      )}
    </div>
  );
}
