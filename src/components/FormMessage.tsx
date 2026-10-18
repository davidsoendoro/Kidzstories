import type { FormState } from "@/app/actions/auth";

export function FormMessage({ state }: { state: FormState }) {
  if (!state) return null;
  if (state.error) {
    return <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-800 ring-1 ring-red-200">{state.error}</p>;
  }
  if (state.message) {
    return <p role="status" className="rounded-2xl bg-leaf/10 px-4 py-3 text-sm font-medium text-emerald-900 ring-1 ring-leaf/30">{state.message}</p>;
  }
  return null;
}
