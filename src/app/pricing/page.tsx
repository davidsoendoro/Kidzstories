import { PricingCards } from "@/components/PricingCards";

export const metadata = { title: "Pricing" };

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  const { need } = await searchParams;
  return (
    <section className="container-page py-12">
      <p className="eyebrow">Pricing</p>
      <h1 className="mt-2 text-4xl font-bold">Packages that grow with your library</h1>
      {need && (
        <p className="mt-4 rounded-2xl bg-sun/20 px-4 py-3 text-sm font-semibold ring-1 ring-sun/50">
          You need a {need === "video" ? "video" : "story"} credit to continue - pick a package below.
        </p>
      )}
      <p className="mt-3 max-w-2xl text-ink/70">
        Each package is paid once and covers the AI-powered creation of your stories, illustrations and videos. Guided edits are always free.
        Printing is optional and priced close to cost because most of the work is already done.
      </p>
      <div className="mt-10"><PricingCards /></div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          ["Do credits expire?", "No. Use your story and video credits whenever you like."],
          ["Can I change the story?", "Yes - choose the personal details and tweak any page. Edits must stay close to the original template so every book keeps its gentle message and happy ending."],
          ["What if generation fails?", "Your credit is refunded automatically and you can try again."],
        ].map(([q, a]) => (
          <div key={q} className="card">
            <h3 className="font-bold">{q}</h3>
            <p className="mt-2 text-sm text-ink/70">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
