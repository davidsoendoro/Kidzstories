import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { checkPageEdit, renderAnchor, renderText, type SlotValues, type StoryChild } from "../story";
import type { StoryTemplate } from "../templates";

const MODEL = "claude-opus-5-5";

const PersonalisedStory = z.object({
  pages: z.array(z.object({ text: z.string() })),
});

const SYSTEM = `You lightly personalise children's picture-book pages for Kidzstories.

You receive a story template that has already been filled in for one child. Your job is a gentle polish, not a rewrite:
- Keep every page's beat, events and order exactly as given. Never add, remove, merge or reorder pages.
- Keep most of the original wording. Change at most a short phrase or add one small detail per page.
- You may weave in at most one of the child's interests where it fits naturally; skip it if it doesn't.
- Keep the required words listed for each page, and keep the child's name wherever it appears.
- Keep each page about the same length as the original.
- Warm, gentle, age-appropriate language. Nothing scary, violent or unkind.
Return one entry per page, in order.`;

export function hasTextModel() {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * Returns page texts for the story. Starts from the deterministic template
 * rendering; when Claude is configured, asks it for a light personal polish and
 * keeps a polished page only if it passes the same guardrails as manual edits.
 */
export async function personalisePages(params: {
  template: StoryTemplate;
  child: StoryChild & { age: number; interests: string };
  slots: SlotValues;
}): Promise<string[]> {
  const { template, child, slots } = params;
  const base = template.pages.map((p) => renderText(p.text, child, slots));
  if (!hasTextModel()) return base;

  const anchors = template.pages.map((p) => p.anchors.map((a) => renderAnchor(a, child, slots)));
  const payload = {
    child: { name: child.name, age: child.age, pronoun: child.pronoun, interests: child.interests || "none given" },
    pages: base.map((text, i) => ({ page: i + 1, beat: template.pages[i].beat, required_words: anchors[i], text })),
  };

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(PersonalisedStory) },
      system: SYSTEM,
      messages: [{ role: "user", content: JSON.stringify(payload) }],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) return base;
    const polished = response.parsed_output.pages;
    if (polished.length !== base.length) return base;

    return base.map((original, i) => {
      const candidate = polished[i].text.trim();
      const check = checkPageEdit({
        original,
        edited: candidate,
        anchors: anchors[i],
        child,
        requiresName: template.pages[i].text.includes("{{name}}"),
      });
      return check.ok ? candidate : original;
    });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[ai/text] Claude API error ${error.status}: ${error.message}`);
    } else {
      console.error("[ai/text] personalisation failed", error);
    }
    return base;
  }
}
