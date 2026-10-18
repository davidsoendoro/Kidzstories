import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { privateFile } from "@/lib/http";
import { getPrivate } from "@/lib/storage";
import { parsePages } from "@/lib/story";

/** Page illustration (contains the child's likeness, so it's private like photos). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string; page: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });
  const { id, page } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id } });
  const p = story ? parsePages(story.pages)[Number(page)] : undefined;
  if (!p?.illustrationKey) return new Response("Not found", { status: 404 });
  return privateFile(await getPrivate(p.illustrationKey), p.illustrationMime ?? "image/png");
}
