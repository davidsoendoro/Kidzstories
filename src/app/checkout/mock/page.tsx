import { notFound } from "next/navigation";
import { completeMockCheckout } from "@/app/actions/billing";
import { SubmitButton } from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockPaymentsAllowed } from "@/lib/payments";
import { formatMoney, getPackage } from "@/lib/pricing";

export const metadata = { title: "Test checkout" };

/** Development-only checkout used when Stripe isn't configured. */
export default async function MockCheckout({ searchParams }: { searchParams: Promise<{ kind?: string; id?: string }> }) {
  if (!mockPaymentsAllowed()) notFound();
  const user = await requireUser();
  const { kind, id } = await searchParams;
  if (!id || (kind !== "package" && kind !== "print")) notFound();

  const item =
    kind === "package"
      ? await db.purchase.findFirst({ where: { id, userId: user.id } }).then((p) => p && { label: `${getPackage(p.packageId)?.name} package`, amount: p.amountCents })
      : await db.printOrder.findFirst({ where: { id, userId: user.id }, include: { story: true } }).then((o) => o && { label: `Print: ${o.story.title} (×${o.quantity})`, amount: o.amountCents });
  if (!item) notFound();

  return (
    <div className="container-page max-w-md py-16">
      <form action={completeMockCheckout} className="card space-y-5">
        <span className="chip bg-sky/20">Test mode - no real payment</span>
        <h1 className="text-2xl font-bold">Checkout</h1>
        <div className="flex justify-between text-lg"><span>{item.label}</span><span className="font-bold">{formatMoney(item.amount)}</span></div>
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="id" value={id} />
        <SubmitButton className="btn-primary w-full py-3" pendingText="Processing...">Pay {formatMoney(item.amount)}</SubmitButton>
        <p className="text-xs text-ink/60">Set STRIPE_SECRET_KEY to use real Stripe Checkout.</p>
      </form>
    </div>
  );
}
