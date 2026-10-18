import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { privateFile } from "@/lib/http";
import { buildStoryPdf } from "@/lib/pdf";
import { parsePages } from "@/lib/story";
import { getTemplate } from "@/lib/templates";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const story = await db.story.findFirst({ where: { id, userId: user.id, status: "ready" }, include: { child: true } });
  const template = story && getTemplate(story.templateId);
  if (!story || !template) return new Response("Not found", { status: 404 });
  const pdf = await buildStoryPdf({ title: story.title, childName: story.child.name, pages: parsePages(story.pages), palette: template.palette });
  const filename = story.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "story";
  return privateFile(pdf, "application/pdf", { "Content-Disposition": `attachment; filename="${filename}.pdf"` });
}
