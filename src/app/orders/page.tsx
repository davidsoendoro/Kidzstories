import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney, getPackage, PRINT_OPTIONS, type PrintFormat } from "@/lib/pricing";

export const metadata = { title: "Orders" };

const PRINT_STATUS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid - preparing for print",
  in_production: "Printing",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ paid?: string }> }) {
  const user = await requireUser();
  const { paid } = await searchParams;
  const [prints, purchases] = await Promise.all([
    db.printOrder.findMany({ where: { userId: user.id }, include: { story: true }, orderBy: { createdAt: "desc" } }),
    db.purchase.findMany({ where: { userId: user.id, status: "paid" }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <div className="container-page max-w-4xl py-10">
      {paid && <p className="mb-6 rounded-2xl bg-leaf/15 px-4 py-3 font-semibold text-emerald-900 ring-1 ring-leaf/30">Thank you! Your print order is confirmed.</p>}
      <h1 className="text-4xl font-bold">Orders</h1>
      <section className="mt-8">
        <h2 className="text-2xl font-bold">Printed books</h2>
        {prints.length === 0 ? <p className="mt-3 text-ink/60">No print orders yet.</p> : (
          <ul className="mt-4 space-y-3">
            {prints.map((o) => (
              <li key={o.id} className="card flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/stories/${o.storyId}`} className="font-bold hover:text-berry">{o.story.title}</Link>
                  <p className="text-sm text-ink/60">{PRINT_OPTIONS[o.format as PrintFormat]?.label} × {o.quantity} · to {o.shipName}, {o.shipCity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatMoney(o.amountCents)}</p>
                  <p className="chip mt-1">{PRINT_STATUS[o.status] ?? o.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-10">
        <h2 className="text-2xl font-bold">Packages</h2>
        {purchases.length === 0 ? <p className="mt-3 text-ink/60">No packages yet. <Link href="/pricing" className="font-semibold text-berry">See pricing</Link>.</p> : (
          <ul className="mt-4 space-y-3">
            {purchases.map((p) => (
              <li key={p.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-bold">{getPackage(p.packageId)?.name ?? p.packageId}</p>
                  <p className="text-sm text-ink/60">{p.storyCredits} story · {p.videoCredits} video credits · {p.paidAt?.toLocaleDateString()}</p>
                </div>
                <p className="font-bold">{formatMoney(p.amountCents)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
