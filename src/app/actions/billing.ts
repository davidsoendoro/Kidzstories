"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckout, fulfillCheckout, mockPaymentsAllowed } from "@/lib/payments";
import { getPackage, printQuote, PRINT_OPTIONS, type PrintFormat } from "@/lib/pricing";
import type { FormState } from "./auth";

export async function buyPackage(form: FormData) {
  const user = await requireUser();
  const pkg = getPackage(String(form.get("packageId")));
  if (!pkg) redirect("/pricing");
  const purchase = await db.purchase.create({
    data: { userId: user.id, packageId: pkg.id, amountCents: pkg.priceCents, storyCredits: pkg.storyCredits, videoCredits: pkg.videoCredits },
  });
  const url = await createCheckout({ kind: "package", refId: purchase.id, amountCents: pkg.priceCents, description: `Kidzstories ${pkg.name} package`, customerEmail: user.email });
  redirect(url);
}

const PrintSchema = z.object({
  format: z.enum(["softcover", "hardcover"]),
  quantity: z.coerce.number().int().min(1).max(10),
  shipName: z.string().trim().min(1, "Recipient name is required").max(100),
  shipLine1: z.string().trim().min(1, "Address is required").max(150),
  shipLine2: z.string().trim().max(150).default(""),
  shipCity: z.string().trim().min(1, "City is required").max(80),
  shipPostal: z.string().trim().min(2, "Postal code is required").max(20),
  shipCountry: z.string().trim().length(2, "Choose a country"),
});

export async function createPrintOrder(storyId: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const story = await db.story.findFirst({ where: { id: storyId, userId: user.id, status: "ready" } });
  if (!story) return { error: "This story isn't ready to print yet." };
  const parsed = PrintSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { format, quantity, ...ship } = parsed.data;
  const quote = printQuote(format as PrintFormat, quantity);
  const order = await db.printOrder.create({
    data: { userId: user.id, storyId, format, quantity: quote.quantity, amountCents: quote.totalCents, ...ship },
  });
  const url = await createCheckout({
    kind: "print",
    refId: order.id,
    amountCents: quote.totalCents,
    description: `${PRINT_OPTIONS[format as PrintFormat].label} print x${quote.quantity}: ${story.title}`,
    customerEmail: user.email,
  });
  redirect(url);
}

/** Development-only stand-in for the Stripe checkout page. */
export async function completeMockCheckout(form: FormData) {
  if (!mockPaymentsAllowed()) redirect("/");
  const user = await requireUser();
  const kind = String(form.get("kind"));
  const id = String(form.get("id"));
  const owned =
    kind === "package"
      ? await db.purchase.findFirst({ where: { id, userId: user.id } })
      : await db.printOrder.findFirst({ where: { id, userId: user.id } });
  if (!owned) redirect("/dashboard");
  await fulfillCheckout(kind, id);
  redirect(kind === "package" ? "/dashboard?paid=1" : "/orders?paid=1");
}
