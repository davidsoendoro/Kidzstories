import { dinoTemplate } from "./dino";
import { forestTemplate } from "./forest";
import { oceanTemplate } from "./ocean";
import { spaceTemplate } from "./space";
import type { StoryTemplate } from "./types";

export * from "./types";

export const TEMPLATES: StoryTemplate[] = [spaceTemplate, forestTemplate, oceanTemplate, dinoTemplate];

export function getTemplate(id: string): StoryTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
