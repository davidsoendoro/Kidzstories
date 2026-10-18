import "server-only";
import { db } from "./db";
import { personalisePages } from "./ai/text";
import { getImageProvider } from "./ai/images";
import { getVideoProvider, readingTimeMs } from "./ai/video";
import { getPrivate, newStorageKey, putPrivate } from "./storage";
import { parsePages, parseSlots, renderTitle, type Pronoun, type StoryPage } from "./story";
import { getTemplate } from "./templates";

const MAX_REFERENCE_PHOTOS = 3;

function extFor(mime: string) {
  return mime === "image/svg+xml" ? "svg" : mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : mime.startsWith("video/") ? "mp4" : mime.includes("json") ? "json" : "jpg";
}

/**
 * Generates text and illustrations for a story. Runs in the background after
 * the customer confirms; in production move this to a durable job queue.
 */
export async function generateStory(storyId: string) {
  const story = await db.story.findUnique({ where: { id: storyId }, include: { child: { include: { photos: true } } } });
  if (!story) return;
  const template = getTemplate(story.templateId);
  if (!template) {
    await db.story.update({ where: { id: storyId }, data: { status: "failed", error: "Template not found" } });
    return;
  }

  try {
    const child = { name: story.child.name, pronoun: story.child.pronoun as Pronoun, age: story.child.age, interests: story.child.interests };
    const slots = parseSlots(story.customizations);
    const texts = await personalisePages({ template, child, slots });

    const referencePhotos = await Promise.all(
      story.child.photos.slice(0, MAX_REFERENCE_PHOTOS).map(async (p) => ({ data: await getPrivate(p.storageKey), mime: p.mimeType })),
    );

    const provider = getImageProvider();
    const pages: StoryPage[] = [];
    for (let i = 0; i < template.pages.length; i++) {
      const tp = template.pages[i];
      const art = await provider.illustrate({
        prompt: tp.scene.prompt,
        scene: tp.scene,
        palette: template.palette,
        childName: child.name,
        childAppearance: story.child.appearance,
        pageNumber: i + 1,
        referencePhotos,
      });
      const key = newStorageKey(story.userId, extFor(art.mime));
      await putPrivate(key, art.data);
      pages.push({ text: texts[i], illustrationKey: key, illustrationMime: art.mime });
    }

    await db.story.update({
      where: { id: storyId },
      data: { status: "ready", pages: JSON.stringify(pages), title: renderTitle(template, child, slots), error: null },
    });
  } catch (error) {
    console.error("[generation] story failed", error);
    await db.story.update({ where: { id: storyId }, data: { status: "failed", error: "Generation failed - your credit has been refunded." } });
    await db.user.update({ where: { id: story.userId }, data: { storyCredits: { increment: 1 } } });
  }
}

export async function generateVideo(videoId: string) {
  const video = await db.video.findUnique({ where: { id: videoId }, include: { story: true } });
  if (!video) return;
  try {
    const pages = parsePages(video.story.pages);
    const result = await getVideoProvider().render({
      storyTitle: video.story.title,
      scenes: pages.map((p, i) => ({ page: i + 1, text: p.text, illustrationKey: p.illustrationKey, durationMs: readingTimeMs(p.text) })),
    });
    const key = newStorageKey(video.userId, extFor(result.mime));
    await putPrivate(key, result.data);
    await db.video.update({ where: { id: videoId }, data: { status: "ready", storageKey: key, mimeType: result.mime, error: null } });
  } catch (error) {
    console.error("[generation] video failed", error);
    await db.video.update({ where: { id: videoId }, data: { status: "failed", error: "Video generation failed - your credit has been refunded." } });
    await db.user.update({ where: { id: video.userId }, data: { videoCredits: { increment: 1 } } });
  }
}
