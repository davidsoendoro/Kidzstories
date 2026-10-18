import { getTemplate, type StoryTemplate } from "./templates";

/**
 * Guardrails that keep every story close to its template.
 *
 * Customers can personalise a story in two ways:
 *  1. Slot values (companion, colours, snacks...) - chosen from the template's
 *     options, or typed in when the slot allows it (short, sanitised text).
 *  2. Page edits - free text, accepted only when the page still delivers the
 *     template's beat: required anchor words stay, the child stays the hero,
 *     length stays similar and most of the original wording is retained.
 * The same checks run on AI-personalised text, so the model can't drift either.
 */

export type Pronoun = "he" | "she" | "they";

export interface StoryChild {
  name: string;
  pronoun: Pronoun;
}

export interface StoryPage {
  text: string;
  /** Private storage key of the illustration, once generated. */
  illustrationKey?: string;
  illustrationMime?: string;
  edited?: boolean;
}

export const LIMITS = {
  customSlotMaxLength: 40,
  minRetention: 0.55,
  minLengthRatio: 0.6,
  maxLengthRatio: 1.5,
  maxNovelWords: 14,
} as const;

const BLOCKLIST = [
  "kill", "killed", "killing", "blood", "bloody", "gun", "guns", "knife", "weapon", "die", "dies", "died", "dead",
  "death", "murder", "hate", "stupid", "idiot", "ugly", "shut up", "drugs", "beer", "wine", "sexy", "damn", "hell",
  "scream in pain", "monster ate", "fat",
];

const STOPWORDS = new Set(
  "a an the and or but so to of in on at by for with from up down out into onto over under is was were be been it its this that these those he she they them his her their i you we me my your our very just then as all".split(" "),
);

export function pronounForms(p: Pronoun) {
  switch (p) {
    case "he":
      return { they: "he", them: "him", their: "his", They: "He", Their: "His" };
    case "she":
      return { they: "she", them: "her", their: "her", They: "She", Their: "Her" };
    default:
      return { they: "they", them: "them", their: "their", They: "They", Their: "Their" };
  }
}

export function containsBlockedContent(text: string): string | null {
  const lower = text.toLowerCase();
  for (const word of BLOCKLIST) {
    const re = new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z])`, "i");
    if (re.test(lower)) return word;
  }
  return null;
}

/** Child names and custom slot values: short, plain text, nothing that looks like markup or placeholders. */
export function sanitizeShortText(value: string, maxLength: number = LIMITS.customSlotMaxLength): { ok: true; value: string } | { ok: false; error: string } {
  const v = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!v) return { ok: false, error: "Please enter a value." };
  if (v.length > maxLength) return { ok: false, error: `Keep it under ${maxLength} characters.` };
  if (!/^[\p{L}\p{N} '\-,.!]+$/u.test(v)) return { ok: false, error: "Only letters, numbers and simple punctuation are allowed." };
  const blocked = containsBlockedContent(v);
  if (blocked) return { ok: false, error: `"${blocked}" isn't suitable for a children's story.` };
  return { ok: true, value: v };
}

export type SlotValues = Record<string, string>;

export function validateSlots(template: StoryTemplate, input: Record<string, string | undefined>): { ok: true; values: SlotValues } | { ok: false; errors: Record<string, string> } {
  const values: SlotValues = {};
  const errors: Record<string, string> = {};
  for (const slot of template.slots) {
    const raw = (input[slot.key] ?? "").trim();
    if (!raw) {
      values[slot.key] = slot.default;
      continue;
    }
    if (slot.options.includes(raw)) {
      values[slot.key] = raw;
      continue;
    }
    if (!slot.allowCustom) {
      errors[slot.key] = "Please choose one of the options.";
      continue;
    }
    const res = sanitizeShortText(raw);
    if (res.ok) values[slot.key] = res.value;
    else errors[slot.key] = res.error;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}

function fillVars(text: string, child: StoryChild, slots: SlotValues): string {
  const vars: Record<string, string> = { name: child.name, ...pronounForms(child.pronoun), ...slots };
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

/** Anchors are matched case-insensitively and shown as-is, so they skip sentence capitalisation. */
export function renderAnchor(anchor: string, child: StoryChild, slots: SlotValues): string {
  return fillVars(anchor, child, slots);
}

export function renderText(text: string, child: StoryChild, slots: SlotValues): string {
  const rendered = fillVars(text, child, slots);
  // Fix capitalisation when a slot value starts a sentence ("a friendly robot" -> "A friendly robot").
  return rendered.replace(/(^|[.!?]\s+|(?:^|\s)["“])([a-z])/g, (_, pre: string, ch: string) => pre + ch.toUpperCase());
}

export function renderTitle(template: StoryTemplate, child: StoryChild, slots: SlotValues) {
  return renderText(template.title, child, slots);
}

export function renderTemplatePages(template: StoryTemplate, child: StoryChild, slots: SlotValues): string[] {
  return template.pages.map((p) => renderText(p.text, child, slots));
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
}

function contentWords(text: string): string[] {
  return words(text).filter((w) => !STOPWORDS.has(w) && w.length > 1);
}

export interface EditCheck {
  ok: boolean;
  issues: string[];
  retention: number;
}

/**
 * Checks an edited page against the template page it came from.
 * `original` is the template page rendered for this child; anchors are rendered too.
 */
export function checkPageEdit(params: {
  original: string;
  edited: string;
  anchors: string[];
  child: StoryChild;
  requiresName: boolean;
}): EditCheck {
  const { original, edited, anchors, child, requiresName } = params;
  const issues: string[] = [];
  const text = edited.replace(/\s+/g, " ").trim();

  if (!text) return { ok: false, issues: ["The page can't be empty."], retention: 0 };
  if (/[{}<>]/.test(text)) issues.push("Curly braces and angle brackets aren't allowed.");

  const blocked = containsBlockedContent(text);
  if (blocked) issues.push(`"${blocked}" isn't suitable for a children's story.`);

  const ratio = text.length / Math.max(original.length, 1);
  if (ratio < LIMITS.minLengthRatio) issues.push("This page is now much shorter than the template - keep the main moment of the page.");
  if (ratio > LIMITS.maxLengthRatio) issues.push("This page is now much longer than the template - small tweaks only.");

  const lower = text.toLowerCase();
  const missing = anchors.filter((a) => !lower.includes(a.toLowerCase()));
  if (missing.length) issues.push(`Keep these story words on this page: ${missing.join(", ")}.`);

  if (requiresName && !lower.includes(child.name.toLowerCase())) {
    issues.push(`${child.name} is the hero of this page - keep ${pronounForms(child.pronoun).their} name in it.`);
  }

  const origWords = new Set(contentWords(original));
  const editedWords = contentWords(text);
  const editedSet = new Set(editedWords);
  let kept = 0;
  for (const w of origWords) if (editedSet.has(w)) kept++;
  const retention = origWords.size ? kept / origWords.size : 1;
  if (retention < LIMITS.minRetention) {
    issues.push("This rewrite strays too far from the template. Keep most of the original wording and change details only.");
  }
  const novel = new Set(editedWords.filter((w) => !origWords.has(w)));
  if (novel.size > LIMITS.maxNovelWords) {
    issues.push("Too many new ideas were added to this page - stories can be tweaked, not rewritten.");
  }

  return { ok: issues.length === 0, issues, retention };
}

/** Convenience: validate an edit to page `index` of a stored story. */
export function checkStoryPageEdit(templateId: string, index: number, edited: string, child: StoryChild, slots: SlotValues): EditCheck {
  const template = getTemplate(templateId);
  const page = template?.pages[index];
  if (!template || !page) return { ok: false, issues: ["Unknown page."], retention: 0 };
  return checkPageEdit({
    original: renderText(page.text, child, slots),
    edited,
    anchors: page.anchors.map((a) => renderAnchor(a, child, slots)),
    child,
    requiresName: page.text.includes("{{name}}"),
  });
}

export function parsePages(json: string): StoryPage[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseSlots(json: string): SlotValues {
  try {
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
