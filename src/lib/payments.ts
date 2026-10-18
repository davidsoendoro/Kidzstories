import "server-only";
import Stripe from "stripe";
import { db } from "./db";

export type CheckoutKind = "package" | "print";

export function paymentsMode(): "stripe" | "mock" {
  return process.env.STRIPE_SECRET_KEY ? "stripe" : "mock";
}

/** Mock checkout is for local dev, or staging demos that explicitly opt in. */
export function mockPaymentsAllowed() {
  return paymentsMode() === "mock" && (process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_PAYMENTS === "true");
}

function appUrl() {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

let stripeClient: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe is not configured");
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

/** Creates a hosted checkout and returns the URL to redirect the customer to. */
export async function createCheckout(params: {
  kind: CheckoutKind;
  refId: string;
  amountCents: number;
  description: string;
  customerEmail: string;
}): Promise<string> {
  const { kind, refId, amountCents, description, customerEmail } = params;
  const returnPath = kind === "package" ? "/dashboard" : "/orders";

  if (paymentsMode() === "mock") {
    if (!mockPaymentsAllowed()) throw new Error("Payments are not configured");
    return `/checkout/mock?kind=${kind}&id=${encodeURIComponent(refId)}`;
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail,
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: amountCents, product_data: { name: description } } }],
    metadata: { kind, refId },
    success_url: `${appUrl()}${returnPath}?paid=1`,
    cancel_url: `${appUrl()}${returnPath}?cancelled=1`,
  });
  const ref = { checkoutRef: session.id };
  if (kind === "package") await db.purchase.update({ where: { id: refId }, data: ref });
  else await db.printOrder.update({ where: { id: refId }, data: ref });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Idempotent: credits are granted only on the pending -> paid transition. */
export async function fulfillPurchase(purchaseId: string) {
  await db.$transaction(async (tx) => {
    const updated = await tx.purchase.updateMany({ where: { id: purchaseId, status: "pending" }, data: { status: "paid", paidAt: new Date() } });
    if (updated.count === 0) return;
    const p = await tx.purchase.findUniqueOrThrow({ where: { id: purchaseId } });
    await tx.user.update({
      where: { id: p.userId },
      data: { storyCredits: { increment: p.storyCredits }, videoCredits: { increment: p.videoCredits } },
    });
  });
}

export async function fulfillPrintOrder(orderId: string) {
  await db.printOrder.updateMany({ where: { id: orderId, status: "pending_payment" }, data: { status: "paid", paidAt: new Date() } });
}

export async function fulfillCheckout(kind: string, refId: string) {
  if (kind === "package") await fulfillPurchase(refId);
  else if (kind === "print") await fulfillPrintOrder(refId);
}
