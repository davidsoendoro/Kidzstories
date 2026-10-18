import { describe, expect, it } from "vitest";
import { checkPageEdit, checkStoryPageEdit, renderAnchor, renderTemplatePages, renderText, sanitizeShortText, validateSlots } from "./story";
import { getTemplate, TEMPLATES } from "./templates";

const maya = { name: "Maya", pronoun: "she" as const };
const space = getTemplate("moon-mission")!;
const defaults = Object.fromEntries(space.slots.map((s) => [s.key, s.default]));

describe("templates", () => {
  it("every anchor appears in its rendered default page", () => {
    for (const t of TEMPLATES) {
      const slots = Object.fromEntries(t.slots.map((s) => [s.key, s.default]));
      const pages = renderTemplatePages(t, maya, slots);
      t.pages.forEach((p, i) => {
        for (const a of p.anchors) expect(pages[i].toLowerCase(), `${t.id} page ${i + 1}`).toContain(renderAnchor(a, maya, slots).toLowerCase());
        expect(pages[i]).not.toMatch(/\{\{|\}\}/);
      });
    }
  });

  it("an unchanged page always passes the guardrails", () => {
    for (const t of TEMPLATES) {
      const slots = Object.fromEntries(t.slots.map((s) => [s.key, s.default]));
      renderTemplatePages(t, maya, slots).forEach((text, i) => {
        expect(checkStoryPageEdit(t.id, i, text, maya, slots).ok, `${t.id} page ${i + 1}`).toBe(true);
      });
    }
  });
});

describe("renderText", () => {
  it("fills pronouns and capitalises slot values that start a sentence", () => {
    expect(renderText("{{They}} smiled at {{their}} {{pet}}.", maya, { pet: "cat" })).toBe("She smiled at her cat.");
    expect(renderText("It beeped. {{companion}} waved.", maya, { companion: "a robot" })).toBe("It beeped. A robot waved.");
  });
  it("does not capitalise after a closing quote", () => {
    expect(renderText('"Hold on tight," it said.', maya, {})).toBe('"Hold on tight," it said.');
  });
});

describe("slot validation", () => {
  it("accepts options, defaults and safe custom text", () => {
    const res = validateSlots(space, { companion: "a sleepy penguin named Pip", rocketColor: "blue" });
    expect(res).toEqual({ ok: true, values: { companion: "a sleepy penguin named Pip", rocketColor: "blue", snack: "strawberry pancakes" } });
  });
  it("rejects custom text where the slot is fixed", () => {
    const res = validateSlots(space, { rocketColor: "neon camouflage" });
    expect(res.ok).toBe(false);
  });
  it("rejects unsafe or markup-like custom values", () => {
    expect(sanitizeShortText("a dragon with a gun").ok).toBe(false);
    expect(sanitizeShortText("{{name}}").ok).toBe(false);
    expect(sanitizeShortText("<script>").ok).toBe(false);
    expect(sanitizeShortText("x".repeat(41)).ok).toBe(false);
  });
});

describe("page edit guardrails", () => {
  const original = renderText(space.pages[3].text, maya, defaults);
  const anchors = space.pages[3].anchors;
  const check = (edited: string) => checkPageEdit({ original, edited, anchors, child: maya, requiresName: false });

  it("allows small tweaks", () => {
    const tweaked = original.replace("shiny", "sparkly").replace("past the clouds", "past the fluffy clouds");
    expect(check(tweaked).ok).toBe(true);
  });

  it("rejects a page that drops its anchor words", () => {
    const res = check(original.replace(/rocket/g, "car").replace("into space", "into town"));
    expect(res.ok).toBe(false);
    expect(res.issues.join(" ")).toMatch(/rocket|space/);
  });

  it("rejects a complete rewrite even when anchors are kept", () => {
    const res = check("Maya decided the rocket was boring and went to space on a bus with pirates who sang loudly forever and ever.");
    expect(res.ok).toBe(false);
  });

  it("rejects unsafe content", () => {
    expect(check(original + " Then a monster ate the rocket.").ok).toBe(false);
  });

  it("requires the hero's name where the template has it", () => {
    const named = renderText(space.pages[4].text, maya, defaults);
    const res = checkStoryPageEdit("moon-mission", 4, named.replace("Maya", "She"), maya, defaults);
    expect(res.ok).toBe(false);
  });
});
