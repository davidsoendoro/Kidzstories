import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import { PricingCards } from "@/components/PricingCards";
import { TEMPLATES } from "@/lib/templates";

const STEPS = [
  { title: "Pick a story", body: "Choose from hand-written templates crafted by children's authors - each with a gentle message and a happy ending." },
  { title: "Add your child", body: "Their name, age and a few photos so the illustrations look like them. Photos stay private and encrypted." },
  { title: "Make it theirs", body: "Choose their sidekick, favourite snack and more, then tweak any page. Our guide keeps the story on track." },
  { title: "Read, watch, print", body: "Read it online, turn it into a short animated video, or order a premium printed book for a small extra fee." },
];

export default function Home() {
  return (
    <>
      <section className="container-page grid items-center gap-12 pb-16 pt-12 md:grid-cols-2 md:pt-20">
        <div>
          <p className="eyebrow">Personalised picture books</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] sm:text-6xl">
            A storybook where <span className="text-berry">your child</span> is the hero.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink/70">
            Kidzstories turns hand-crafted story templates into a one-of-a-kind illustrated book starring your little one -
            ready to read tonight, animate as a short video, or print as a keepsake.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary px-7 py-3 text-base">Create their story</Link>
            <Link href="/templates" className="btn-secondary px-7 py-3 text-base">Browse stories</Link>
          </div>
          <p className="mt-5 text-sm text-ink/60">Photos are encrypted and never shared or shown publicly.</p>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          {TEMPLATES.slice(0, 4).map((t, i) => (
            <div key={t.id} className={i % 2 ? "translate-y-8" : ""}>
              <BookCover template={t} title={t.title.replace("{{name}}", ["Maya", "Leo", "Ava", "Noah"][i])} size="sm" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-16">
        <div className="container-page">
          <h2 className="text-3xl font-bold">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sun font-display font-bold">{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The library</p>
            <h2 className="mt-2 text-3xl font-bold">Stories ready to star your child</h2>
          </div>
          <Link href="/templates" className="btn-ghost">See all</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <Link key={t.id} href={`/templates/${t.id}`} className="group">
              <BookCover template={t} />
              <p className="mt-3 text-sm text-ink/70 group-hover:text-ink">{t.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page py-16" id="pricing">
        <p className="eyebrow">Simple packages</p>
        <h2 className="mt-2 text-3xl font-bold">Pay once per package. Printing is just a little extra.</h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          Your package covers the creative work of generating each story and its illustrations. When you want a physical copy,
          printing is priced close to cost.
        </p>
        <div className="mt-8">
          <PricingCards />
        </div>
      </section>
    </>
  );
}
