"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePrivate, newStorageKey, putPrivate, sniffImage } from "@/lib/storage";
import { sanitizeShortText } from "@/lib/story";
import type { FormState } from "./auth";

const MAX_PHOTOS_PER_CHILD = 6;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

function readChild(form: FormData) {
  const name = sanitizeShortText(String(form.get("name") ?? ""), 30);
  if (!name.ok) return { error: `Name: ${name.error}` } as const;
  const age = Number(form.get("age"));
  if (!Number.isInteger(age) || age < 0 || age > 14) return { error: "Age must be between 0 and 14." } as const;
  const pronoun = String(form.get("pronoun"));
  if (!["he", "she", "they"].includes(pronoun)) return { error: "Choose how the story should refer to your child." } as const;
  const appearance = String(form.get("appearance") ?? "").trim().slice(0, 200);
  const interests = String(form.get("interests") ?? "").trim().slice(0, 200);
  return { data: { name: name.value, age, pronoun, appearance, interests } } as const;
}

export async function createChild(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const res = readChild(form);
  if ("error" in res) return { error: res.error };
  const child = await db.child.create({ data: { ...res.data, userId: user.id } });
  redirect(`/children/${child.id}?welcome=1`);
}

export async function updateChild(childId: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const res = readChild(form);
  if ("error" in res) return { error: res.error };
  const updated = await db.child.updateMany({ where: { id: childId, userId: user.id }, data: res.data });
  if (!updated.count) return { error: "Child not found." };
  revalidatePath(`/children/${childId}`);
  return { ok: true, message: "Saved." };
}

export async function uploadPhotos(childId: string, _: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const child = await db.child.findFirst({ where: { id: childId, userId: user.id }, include: { _count: { select: { photos: true } } } });
  if (!child) return { error: "Child not found." };
  if (form.get("consent") !== "on") return { error: "Please confirm you are this child's parent or guardian." };

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { error: "Choose at least one photo." };
  if (child._count.photos + files.length > MAX_PHOTOS_PER_CHILD) {
    return { error: `You can keep up to ${MAX_PHOTOS_PER_CHILD} photos per child.` };
  }

  for (const file of files) {
    if (file.size > MAX_PHOTO_BYTES) return { error: `${file.name} is larger than 10 MB.` };
    const buf = Buffer.from(await file.arrayBuffer());
    const type = sniffImage(buf);
    if (!type) return { error: `${file.name} isn't a JPEG, PNG or WebP image.` };
    const key = newStorageKey(user.id, type.ext);
    await putPrivate(key, buf);
    await db.photo.create({ data: { userId: user.id, childId, storageKey: key, mimeType: type.mime, sizeBytes: buf.length } });
  }
  revalidatePath(`/children/${childId}`);
  return { ok: true, message: `${files.length} photo${files.length > 1 ? "s" : ""} uploaded privately.` };
}

export async function deletePhoto(photoId: string) {
  const user = await requireUser();
  const photo = await db.photo.findFirst({ where: { id: photoId, userId: user.id } });
  if (!photo) return;
  await deletePrivate(photo.storageKey);
  await db.photo.delete({ where: { id: photo.id } });
  revalidatePath(`/children/${photo.childId}`);
}

export async function deleteChild(childId: string) {
  const user = await requireUser();
  const child = await db.child.findFirst({ where: { id: childId, userId: user.id }, include: { photos: true, stories: true } });
  if (!child) return;
  for (const p of child.photos) await deletePrivate(p.storageKey);
  for (const s of child.stories) {
    for (const page of JSON.parse(s.pages || "[]") as Array<{ illustrationKey?: string }>) {
      if (page.illustrationKey) await deletePrivate(page.illustrationKey);
    }
  }
  await db.child.delete({ where: { id: child.id } });
  redirect("/dashboard");
}
