import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { resetPage, savePageEdit } from "@/app/actions/stories";
import { PageEditor } from "@/components/PageEditor";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePages, parseSlots, type Pronoun } from "@/lib/story";
import { getTemplate } from "@/lib/templates";

export const metadata = { title: "Edit story" };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id }, include: { child: true } });
  const template = story && getTemplate(story.templateId);
  if (!story || !template) notFound();
  if (story.status !== "ready") redirect(`/stories/${id}`);
  const locked = Boolean(await db.printOrder.findFirst({ where: { storyId: id, status: { in: ["paid", "in_production", "shipped"] } } }));
  const pages = parsePages(story.pages);
  const child = { name: story.child.name, pronoun: story.child.pronoun as Pronoun };
  const slots = parseSlots(story.customizations);

  return (
    <div className="container-page py-10">
      <Link href={`/stories/${id}`} className="btn-ghost -ml-4">← Back to the book</Link>
      <h1 className="mt-2 text-4xl font-bold">Tweak the story</h1>
      <div className="mt-4 max-w-3xl rounded-3xl bg-sky/10 p-5 text-sm text-ink/80 ring-1 ring-sky/30">
        <p className="font-bold text-ink">How editing works</p>
        <p className="mt-1">
          Change words, add a little detail or make a line sound more like your family. Each page has to keep its moment in the story,
          its key story words and {child.name} as the hero - that's what keeps every Kidzstories book gentle, well-paced and print-perfect.
        </p>
      </div>
      {locked && <p className="mt-4 rounded-2xl bg-sun/20 px-4 py-3 text-sm font-semibold ring-1 ring-sun/50">This story has been sent to print, so it's locked.</p>}
      <div className="mt-8 space-y-6">
        {pages.map((p, i) => (
          <PageEditor
            key={i}
            index={i}
            beat={template.pages[i]?.beat ?? ""}
            storyId={id}
            templateId={template.id}
            initialText={p.text}
            child={child}
            slots={slots}
            edited={Boolean(p.edited)}
            locked={locked}
            save={savePageEdit.bind(null, id, i)}
            reset={resetPage.bind(null, id, i)}
          />
        ))}
      </div>
    </div>
  );
}
