"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateStory, generateVideo } from "@/lib/generation";
import { deletePrivate } from "@/lib/storage";
import { checkStoryPageEdit, parsePages, parseSlots, renderText, renderTitle, validateSlots, type Pronoun } from "@/lib/story";
import { getTemplate } from "@/lib/templates";
import type { FormState } from "./auth";

export async function createStory(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const template = getTemplate(String(form.get("templateId")));
  if (!template) return { error: "Choose a story template." };
  const child = await db.child.findFirst({ where: { id: String(form.get("childId")), userId: user.id } });
  if (!child) return { error: "Choose which child this story is for." };

  const input: Record<string, string> = {};
  for (const slot of template.slots) {
    const choice = String(form.get(`slot_${slot.key}`) ?? "");
    input[slot.key] = choice === "__custom" ? String(form.get(`custom_${slot.key}`) ?? "") : choice;
  }
  const slots = validateSlots(template, input);
  if (!slots.ok) return { error: "Please fix the highlighted choices.", fieldErrors: slots.errors };

  // Atomically spend one story credit.
  const spent = await db.user.updateMany({ where: { id: user.id, storyCredits: { gt: 0 } }, data: { storyCredits: { decrement: 1 } } });
  if (!spent.count) return { error: "You're out of story credits. Pick a package to keep creating." };

  const story = await db.story.create({
    data: {
      userId: user.id,
      childId: child.id,
      templateId: template.id,
      title: renderTitle(template, { name: child.name, pronoun: child.pronoun as Pronoun }, slots.values),
      status: "generating",
      customizations: JSON.stringify(slots.values),
    },
  });
  after(() => generateStory(story.id));
  redirect(`/stories/${story.id}`);
}

async function ownedStory(storyId: string) {
  const user = await requireUser();
  const story = await db.story.findFirst({ where: { id: storyId, userId: user.id }, include: { child: true } });
  return { user, story };
}

export async function savePageEdit(storyId: string, pageIndex: number, _: FormState, form: FormData): Promise<FormState> {
  const { story } = await ownedStory(storyId);
  if (!story || story.status !== "ready") return { error: "Story isn't ready for editing." };
  if (await db.printOrder.findFirst({ where: { storyId, status: { in: ["paid", "in_production", "shipped"] } } })) {
    return { error: "This story has been sent to print and is now locked." };
  }
  const pages = parsePages(story.pages);
  if (!pages[pageIndex]) return { error: "Unknown page." };

  const text = String(form.get("text") ?? "").replace(/\s+/g, " ").trim();
  const child = { name: story.child.name, pronoun: story.child.pronoun as Pronoun };
  const check = checkStoryPageEdit(story.templateId, pageIndex, text, child, parseSlots(story.customizations));
  if (!check.ok) return { error: check.issues.join(" ") };

  pages[pageIndex] = { ...pages[pageIndex], text, edited: true };
  await db.story.update({ where: { id: story.id }, data: { pages: JSON.stringify(pages) } });
  revalidatePath(`/stories/${storyId}`);
  return { ok: true, message: "Page saved." };
}

export async function resetPage(storyId: string, pageIndex: number) {
  const { story } = await ownedStory(storyId);
  const template = story && getTemplate(story.templateId);
  if (!story || !template?.pages[pageIndex]) return;
  const pages = parsePages(story.pages);
  const child = { name: story.child.name, pronoun: story.child.pronoun as Pronoun };
  pages[pageIndex] = { ...pages[pageIndex], text: renderText(template.pages[pageIndex].text, child, parseSlots(story.customizations)), edited: false };
  await db.story.update({ where: { id: story.id }, data: { pages: JSON.stringify(pages) } });
  revalidatePath(`/stories/${storyId}/edit`);
}

export async function createVideo(storyId: string) {
  const { user, story } = await ownedStory(storyId);
  if (!story || story.status !== "ready") redirect(`/stories/${storyId}`);
  const pending = await db.video.findFirst({ where: { storyId, status: "generating" } });
  if (pending) redirect(`/stories/${storyId}/video`);
  const spent = await db.user.updateMany({ where: { id: user.id, videoCredits: { gt: 0 } }, data: { videoCredits: { decrement: 1 } } });
  if (!spent.count) redirect("/pricing?need=video");
  const video = await db.video.create({ data: { userId: user.id, storyId: story.id } });
  after(() => generateVideo(video.id));
  redirect(`/stories/${storyId}/video`);
}

export async function deleteStory(storyId: string) {
  const { story } = await ownedStory(storyId);
  if (!story) return;
  for (const p of parsePages(story.pages)) if (p.illustrationKey) await deletePrivate(p.illustrationKey);
  const videos = await db.video.findMany({ where: { storyId } });
  for (const v of videos) if (v.storageKey) await deletePrivate(v.storageKey);
  await db.story.delete({ where: { id: story.id } });
  redirect("/dashboard");
}
