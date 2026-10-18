"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/auth";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type ChildValues = { name: string; age: number; pronoun: string; appearance: string; interests: string };

export function ChildForm({ action, initial, submitLabel }: { action: (s: FormState, f: FormData) => Promise<FormState>; initial?: ChildValues; submitLabel: string }) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className="label" htmlFor="name">First name</label>
          <input className="input" id="name" name="name" defaultValue={initial?.name} maxLength={30} required />
        </div>
        <div>
          <label className="label" htmlFor="age">Age</label>
          <input className="input" id="age" name="age" type="number" min={0} max={14} defaultValue={initial?.age ?? 4} required />
        </div>
      </div>
      <fieldset>
        <legend className="label">In the story, call them</legend>
        <div className="flex flex-wrap gap-2">
          {[["she", "she / her"], ["he", "he / him"], ["they", "they / them"]].map(([v, l]) => (
            <label key={v} className="cursor-pointer">
              <input type="radio" name="pronoun" value={v} defaultChecked={(initial?.pronoun ?? "they") === v} className="peer sr-only" />
              <span className="chip bg-white px-4 py-2 text-sm ring-2 ring-ink/10 peer-checked:bg-sky/20 peer-checked:ring-sky">{l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="label" htmlFor="appearance">What do they look like? <span className="font-normal text-ink/50">(optional, helps the illustrator)</span></label>
        <input className="input" id="appearance" name="appearance" defaultValue={initial?.appearance} maxLength={200} placeholder="Curly brown hair, big smile, loves yellow wellies" />
      </div>
      <div>
        <label className="label" htmlFor="interests">Favourite things <span className="font-normal text-ink/50">(optional)</span></label>
        <input className="input" id="interests" name="interests" defaultValue={initial?.interests} maxLength={200} placeholder="Dinosaurs, painting, the colour green" />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
    </form>
  );
}
