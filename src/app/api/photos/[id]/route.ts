import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getPrivate } from "@/lib/storage";
import { privateFile } from "@/lib/http";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const photo = await db.photo.findFirst({ where: { id, userId: user.id } });
  if (!photo) return new Response("Not found", { status: 404 });
  return privateFile(await getPrivate(photo.storageKey), photo.mimeType);
}
