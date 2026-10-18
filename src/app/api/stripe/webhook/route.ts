import type Stripe from "stripe";
import { fulfillCheckout, stripe } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.metadata?.kind && session.metadata.refId) {
      await fulfillCheckout(session.metadata.kind, session.metadata.refId);
    }
  }
  return Response.json({ received: true });
}
