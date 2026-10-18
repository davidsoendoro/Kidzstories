import { createChild } from "@/app/actions/children";
import { ChildForm } from "@/components/ChildForm";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Add a child" };

export default async function NewChildPage() {
  await requireUser();
  return (
    <div className="container-page max-w-2xl py-10">
      <p className="eyebrow">Step 1</p>
      <h1 className="mt-1 text-3xl font-bold">Tell us about the hero</h1>
      <p className="mt-2 text-ink/70">You'll add photos on the next step.</p>
      <div className="card mt-6"><ChildForm action={createChild} submitLabel="Continue" /></div>
    </div>
  );
}
