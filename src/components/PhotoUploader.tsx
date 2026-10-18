"use client";

import { useActionState, useRef } from "react";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

export function PhotoUploader({ action, remaining }: { action: (s: FormState, f: FormData) => Promise<FormState>; remaining: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: FormState, form: FormData) => {
    const res = await action(prev, form);
    if (res?.ok) formRef.current?.reset();
    return res;
  }, undefined);

  if (remaining <= 0) return <p className="text-sm text-ink/60">You've reached the photo limit for this child. Delete one to add another.</p>;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/50 px-6 py-8 text-center hover:border-sky">
        <span className="font-display text-lg font-bold">Choose photos</span>
        <span className="mt-1 text-sm text-ink/60">JPEG, PNG or WebP · up to 10 MB each · {remaining} more allowed</span>
        <input type="file" name="photos" accept="image/jpeg,image/png,image/webp" multiple className="mt-4 text-sm" required />
      </label>
      <p className="text-xs text-ink/60">Clear, well-lit photos of their face work best. Photos are encrypted and only used to illustrate your stories.</p>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-berry" required />
        <span>I am this child's parent or legal guardian and I consent to these photos being used to illustrate their Kidzstories books.</span>
      </label>
      <FormMessage state={state} />
      <SubmitButton pendingText="Encrypting & uploading...">Upload privately</SubmitButton>
    </form>
  );
}
