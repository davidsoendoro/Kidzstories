import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { privateFile } from "@/lib/http";
import { getPrivate } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const video = await db.video.findFirst({ where: { id, userId: user.id } });
  if (!video) return new Response("Not found", { status: 404 });
  if (video.status !== "ready" || !video.storageKey) {
    return Response.json({ status: video.status, error: video.error }, { headers: { "Cache-Control": "no-store" } });
  }
  return privateFile(await getPrivate(video.storageKey), video.mimeType ?? "application/octet-stream");
}
