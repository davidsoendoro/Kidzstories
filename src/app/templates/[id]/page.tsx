import Link from "next/link";
import { notFound } from "next/navigation";
import { BookCover } from "@/components/BookCover";
import { getCurrentUser } from "@/lib/auth";
import { renderText } from "@/lib/story";
import { getTemplate, TEMPLATES } from "@/lib/templates";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}

export default async function TemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = getTemplate(id);
  if (!template) notFound();
  const user = await getCurrentUser();
  const sampleChild = { name: "your child", pronoun: "they" as const };
  const defaults = Object.fromEntries(template.slots.map((s) => [s.key, s.default]));

  return (
    <section className="container-page grid gap-10 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <BookCover template={template} size="lg" />
        <p className="mt-5 text-ink/70">{template.summary}</p>
        <div className="mt-5 space-y-2">
          <p className="text-sm font-bold">You can personalise:</p>
          <ul className="flex flex-wrap gap-2">
            {template.slots.map((s) => <li key={s.key} className="chip">{s.label}</li>)}
            <li className="chip">Small wording tweaks on every page</li>
          </ul>
        </div>
        <Link href={user ? `/stories/new?template=${template.id}` : "/signup"} className="btn-primary mt-6 w-full py-3 text-base">
          Make this story for my child
        </Link>
      </div>
      <div>
        <h2 className="text-2xl font-bold">Read a preview</h2>
        <ol className="mt-6 space-y-4">
          {template.pages.map((p, i) => (
            <li key={i} className="card flex gap-4">
              <span className="font-display text-2xl font-bold text-berry/70">{i + 1}</span>
              <p className="text-ink/80">{renderText(p.text, sampleChild, defaults)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
