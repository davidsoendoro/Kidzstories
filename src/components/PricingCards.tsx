import { buyPackage } from "@/app/actions/billing";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, PACKAGES, PRINT_OPTIONS, SHIPPING_CENTS } from "@/lib/pricing";
import Link from "next/link";

export async function PricingCards() {
  const user = await getCurrentUser();
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map((p) => (
          <div key={p.id} className={`card flex flex-col ${p.highlight ? "ring-4 ring-berry/40" : ""}`}>
            {p.highlight && <span className="chip mb-3 self-start bg-berry/15 text-berry">Most loved</span>}
            <h3 className="text-xl font-bold">{p.name}</h3>
            <p className="text-sm text-ink/60">{p.tagline}</p>
            <p className="mt-4 font-display text-4xl font-bold">{formatMoney(p.priceCents)}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-ink/80">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2"><span aria-hidden className="text-leaf">✓</span>{f}</li>
              ))}
            </ul>
            {user ? (
              <form action={buyPackage} className="mt-6">
                <input type="hidden" name="packageId" value={p.id} />
                <button className={p.highlight ? "btn-primary w-full" : "btn-secondary w-full"}>Choose {p.name}</button>
              </form>
            ) : (
              <Link href="/signup" className={`mt-6 ${p.highlight ? "btn-primary" : "btn-secondary"} w-full`}>Get started</Link>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-3xl bg-sun/15 p-6 text-sm text-ink/80 ring-1 ring-sun/40">
        <p className="font-display text-lg font-bold text-ink">Printing add-on</p>
        <p className="mt-1">
          {Object.values(PRINT_OPTIONS).map((o) => `${o.label} ${formatMoney(o.perCopyCents)} per copy`).join(" · ")} · flat {formatMoney(SHIPPING_CENTS)} shipping.
          Order prints any time from a finished story.
        </p>
      </div>
    </div>
  );
}
