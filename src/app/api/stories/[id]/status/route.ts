import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id }, select: { status: true, error: true } });
  if (!story) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(story, { headers: { "Cache-Control": "no-store" } });
}
