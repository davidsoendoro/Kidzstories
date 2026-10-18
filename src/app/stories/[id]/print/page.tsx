import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createPrintOrder } from "@/app/actions/billing";
import { PrintOrderForm } from "@/components/PrintOrderForm";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Order a printed book" };

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id } });
  if (!story) notFound();
  if (story.status !== "ready") redirect(`/stories/${id}`);
  return (
    <div className="container-page py-10">
      <Link href={`/stories/${id}`} className="btn-ghost -ml-4">← Back to the book</Link>
      <h1 className="mt-2 text-4xl font-bold">Print “{story.title}”</h1>
      <p className="mt-2 text-ink/70">Printed at 300 dpi on premium paper with full-bleed illustrations.</p>
      <div className="mt-8"><PrintOrderForm action={createPrintOrder.bind(null, id)} defaultName={user.name} /></div>
    </div>
  );
}
