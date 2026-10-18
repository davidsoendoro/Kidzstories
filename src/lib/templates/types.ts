export interface TemplateSlot {
  key: string;
  label: string;
  help?: string;
  options: string[];
  /** Whether the customer may type their own value (validated + length-limited). */
  allowCustom: boolean;
  default: string;
}

export type SceneKind = "sky" | "space" | "forest" | "sea" | "meadow" | "night" | "volcano" | "home";

export interface SceneSpec {
  kind: SceneKind;
  /** Short art direction used as the illustration prompt. */
  prompt: string;
  /** Simple emoji-free motif names the placeholder renderer draws. */
  motifs: Array<"stars" | "moon" | "rocket" | "trees" | "fish" | "bubbles" | "sun" | "flowers" | "egg" | "mountain" | "house" | "cake">;
}

export interface TemplatePage {
  /** The narrative beat this page must deliver. Edits may not drop it. */
  beat: string;
  /** Page text with {{placeholders}}. */
  text: string;
  /** Words that must remain on the page after any edit (lowercase, rendered). May reference slots. */
  anchors: string[];
  scene: SceneSpec;
}

export interface StoryTemplate {
  id: string;
  title: string;
  summary: string;
  ageRange: string;
  palette: { bg: string; accent: string };
  slots: TemplateSlot[];
  pages: TemplatePage[];
}
