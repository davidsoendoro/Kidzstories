import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { TEMPLATES } from "@/lib/templates";

export const metadata = { title: "Story templates" };

export default function TemplatesPage() {
  return (
    <section className="container-page py-12">
      <p className="eyebrow">The library</p>
      <h1 className="mt-2 text-4xl font-bold">Choose a story</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Every Kidzstories book starts from a template written for little readers. You personalise the details - the heart of the story stays the same.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Link key={t.id} href={`/templates/${t.id}`} className="card group p-4 transition hover:-translate-y-1">
            <BookCover template={t} />
            <div className="px-2 pb-2 pt-4">
              <p className="text-sm text-ink/70">{t.summary}</p>
              <p className="mt-3 text-xs font-semibold text-ink/50">{t.pages.length} pages · Ages {t.ageRange}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
