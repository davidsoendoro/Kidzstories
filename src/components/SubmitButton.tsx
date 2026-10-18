"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ children, pendingText, className = "btn-primary", disabled }: { children: React.ReactNode; pendingText?: string; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || disabled} aria-busy={pending}>
      {pending ? (pendingText ?? "Working...") : children}
    </button>
  );
}
