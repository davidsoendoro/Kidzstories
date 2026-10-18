"use client";

import { useActionState, useMemo, useState } from "react";
import { createStory } from "@/app/actions/stories";
import { renderText, type Pronoun } from "@/lib/story";
import { TEMPLATES } from "@/lib/templates";
import { BookCover } from "./BookCover";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

type ChildOption = { id: string; name: string; pronoun: string; photoCount: number };

export function StoryWizard({ kids, initialTemplate, initialChild, credits }: { kids: ChildOption[]; initialTemplate?: string; initialChild?: string; credits: number }) {
  const [state, action] = useActionState(createStory, undefined);
  const [templateId, setTemplateId] = useState(initialTemplate && TEMPLATES.some((t) => t.id === initialTemplate) ? initialTemplate : TEMPLATES[0].id);
  const [childId, setChildId] = useState(initialChild && kids.some((k) => k.id === initialChild) ? initialChild : kids[0]?.id);
  const template = TEMPLATES.find((t) => t.id === templateId)!;
  const child = kids.find((k) => k.id === childId);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});

  const values = useMemo(() => {
    const v: Record<string, string> = {};
    for (const s of template.slots) {
      const c = choices[`${template.id}:${s.key}`] ?? s.default;
      v[s.key] = c === "__custom" ? custom[`${template.id}:${s.key}`] || s.default : c;
    }
    return v;
  }, [template, choices, custom]);

  const preview = child ? { name: child.name, pronoun: child.pronoun as Pronoun } : { name: "Your child", pronoun: "they" as Pronoun };

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-8">
        <section className="card">
          <h2 className="text-xl font-bold">1. Choose a story</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((t) => (
              <label key={t.id} className="cursor-pointer">
                <input type="radio" name="templateId" value={t.id} checked={t.id === templateId} onChange={() => setTemplateId(t.id)} className="peer sr-only" />
                <div className="rounded-2xl p-1 ring-2 ring-transparent peer-checked:ring-berry peer-focus-visible:ring-sky">
                  <BookCover template={t} title={renderText(t.title, preview, {})} size="sm" />
                </div>
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">2. Who is the hero?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {kids.map((k) => (
              <label key={k.id} className="cursor-pointer">
                <input type="radio" name="childId" value={k.id} checked={k.id === childId} onChange={() => setChildId(k.id)} className="peer sr-only" />
                <span className="chip bg-white px-4 py-2 text-sm ring-2 ring-ink/10 peer-checked:bg-sky/20 peer-checked:ring-sky">{k.name}</span>
              </label>
            ))}
          </div>
          {child && child.photoCount === 0 && (
            <p className="mt-3 text-sm text-ink/60">Tip: add photos of {child.name} first for illustrations that look like them.</p>
          )}
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">3. Make it theirs</h2>
          <div className="mt-4 space-y-6">
            {template.slots.map((s) => {
              const key = `${template.id}:${s.key}`;
              const current = choices[key] ?? s.default;
              const err = state?.fieldErrors?.[s.key];
              return (
                <fieldset key={key}>
                  <legend className="label">{s.label}</legend>
                  <div className="flex flex-wrap gap-2">
                    {[...s.options, ...(s.allowCustom ? ["__custom"] : [])].map((o) => (
                      <label key={o} className="cursor-pointer">
                        <input type="radio" name={`slot_${s.key}`} value={o} checked={current === o} onChange={() => setChoices({ ...choices, [key]: o })} className="peer sr-only" />
                        <span className="chip bg-white px-3 py-1.5 text-sm ring-2 ring-ink/10 peer-checked:bg-sun/30 peer-checked:ring-sun">{o === "__custom" ? "Something else..." : o}</span>
                      </label>
                    ))}
                  </div>
                  {current === "__custom" && (
                    <input className="input mt-2" name={`custom_${s.key}`} maxLength={40} placeholder="Type your own (keep it short and sweet)" value={custom[key] ?? ""} onChange={(e) => setCustom({ ...custom, [key]: e.target.value })} />
                  )}
                  {err && <p className="mt-1 text-sm font-medium text-red-700">{err}</p>}
                </fieldset>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card">
          <BookCover template={template} title={renderText(template.title, preview, values)} />
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-ink/50">First pages</p>
          <div className="mt-2 space-y-3 text-sm text-ink/80">
            {template.pages.slice(0, 3).map((p, i) => <p key={i}>{renderText(p.text, preview, values)}</p>)}
          </div>
          <div className="mt-6 space-y-3">
            <FormMessage state={state} />
            <SubmitButton className="btn-primary w-full py-3 text-base" pendingText="Starting the magic..." disabled={!child || credits < 1}>
              Create story · uses 1 credit
            </SubmitButton>
            <p className="text-center text-xs text-ink/60">
              {credits > 0 ? `You have ${credits} story credit${credits === 1 ? "" : "s"}.` : "You need a story credit - pick a package first."} You can tweak every page afterwards.
            </p>
          </div>
        </div>
      </aside>
    </form>
  );
}
