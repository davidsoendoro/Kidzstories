import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTemplate } from "@/lib/templates";

export const metadata = { title: "My stories" };

const STATUS: Record<string, string> = { generating: "Illustrating...", ready: "Ready to read", failed: "Needs attention", draft: "Draft" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const user = await requireUser();
  const { paid } = await searchParams;
  const [children, stories] = await Promise.all([
    db.child.findMany({ where: { userId: user.id }, include: { _count: { select: { photos: true } } }, orderBy: { createdAt: "asc" } }),
    db.story.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="container-page py-10">
      {paid && <p className="mb-6 rounded-2xl bg-leaf/15 px-4 py-3 font-semibold text-emerald-900 ring-1 ring-leaf/30">Payment received - your credits are ready!</p>}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Hi {user.name.split(" ")[0]}</p>
          <h1 className="mt-1 text-4xl font-bold">Your storybook shelf</h1>
        </div>
        <div className="flex gap-3">
          <div className="card px-5 py-3 text-center"><p className="font-display text-2xl font-bold">{user.storyCredits}</p><p className="text-xs text-ink/60">story credits</p></div>
          <div className="card px-5 py-3 text-center"><p className="font-display text-2xl font-bold">{user.videoCredits}</p><p className="text-xs text-ink/60">video credits</p></div>
          <Link href="/pricing" className="btn-secondary self-center">Get credits</Link>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Children</h2>
          <Link href="/children/new" className="btn-secondary">Add a child</Link>
        </div>
        {children.length === 0 ? (
          <div className="card mt-4 text-center">
            <p className="text-ink/70">Add your child to get started - their name, age and a couple of photos.</p>
            <Link href="/children/new" className="btn-primary mt-4">Add your first child</Link>
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {children.map((c) => (
              <li key={c.id}>
                <Link href={`/children/${c.id}`} className="card flex items-center gap-4 p-4 hover:ring-sky/40">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky/20 font-display text-xl font-bold">{c.name[0]}</span>
                  <span>
                    <span className="block font-bold">{c.name}</span>
                    <span className="text-xs text-ink/60">Age {c.age} · {c._count.photos} private photo{c._count.photos === 1 ? "" : "s"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Stories</h2>
          {children.length > 0 && <Link href="/stories/new" className="btn-primary">New story</Link>}
        </div>
        {stories.length === 0 ? (
          <p className="mt-4 text-ink/60">No stories yet. <Link href="/templates" className="font-semibold text-berry">Browse the library</Link>.</p>
        ) : (
          <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stories.map((s) => {
              const t = getTemplate(s.templateId);
              return (
                <li key={s.id}>
                  <Link href={`/stories/${s.id}`} className="group block">
                    {t && <BookCover template={t} title={s.title} size="sm" />}
                    <p className="mt-2 text-sm font-semibold text-ink/70">{STATUS[s.status] ?? s.status}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
