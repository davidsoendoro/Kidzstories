"use client";

import { useActionState, useMemo, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { checkStoryPageEdit, LIMITS, type SlotValues, type StoryChild } from "@/lib/story";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

/**
 * Edits one page with live guardrail feedback. The same check runs again on
 * the server before saving, so this is guidance, not the enforcement point.
 */
export function PageEditor(props: {
  index: number;
  beat: string;
  storyId: string;
  templateId: string;
  initialText: string;
  child: StoryChild;
  slots: SlotValues;
  edited: boolean;
  locked: boolean;
  save: (s: FormState, f: FormData) => Promise<FormState>;
  reset: () => Promise<void>;
}) {
  const [text, setText] = useState(props.initialText);
  const [state, action] = useActionState(props.save, undefined);
  const check = useMemo(() => checkStoryPageEdit(props.templateId, props.index, text, props.child, props.slots), [text, props.templateId, props.index, props.child, props.slots]);
  const closeness = Math.round(check.retention * 100);
  const dirty = text.trim() !== props.initialText.trim();

  return (
    <div className="card grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated illustration */}
        <img src={`/api/stories/${props.storyId}/pages/${props.index}`} alt={`Page ${props.index + 1} illustration`} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-ink/50">Page {props.index + 1}</p>
        <p className="mt-1 text-sm text-ink/70"><span className="font-semibold">This page must:</span> {props.beat}</p>
      </div>
      <form action={action} className="space-y-3">
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          disabled={props.locked}
          className="input font-display text-lg leading-relaxed"
          aria-describedby={`guide-${props.index}`}
        />
        <div id={`guide-${props.index}`} className="space-y-2">
          <div className="flex items-center gap-3 text-xs font-semibold text-ink/60">
            <span>Closeness to template</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full transition-all ${closeness >= LIMITS.minRetention * 100 ? "bg-leaf" : "bg-berry"}`} style={{ width: `${closeness}%` }} />
            </div>
            <span>{closeness}%</span>
          </div>
          {dirty && !check.ok && (
            <ul className="space-y-1 text-sm text-red-800">
              {check.issues.map((i) => <li key={i}>• {i}</li>)}
            </ul>
          )}
        </div>
        <FormMessage state={state} />
        <div className="flex flex-wrap gap-2">
          <SubmitButton pendingText="Checking & saving..." disabled={props.locked || !dirty || !check.ok}>Save page</SubmitButton>
          {props.edited && !props.locked && (
            <button type="button" className="btn-ghost" onClick={async () => { await props.reset(); window.location.reload(); }}>Restore original</button>
          )}
        </div>
      </form>
    </div>
  );
}
