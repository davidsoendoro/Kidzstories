import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Private, encrypted-at-rest blob storage for child photos, illustrations and
 * videos. Files live outside /public and are only reachable through
 * authenticated route handlers that check ownership.
 *
 * Swap this module for S3/GCS (private bucket + SSE-KMS) in production; the
 * rest of the app only uses putPrivate / getPrivate / deletePrivate.
 */
const ROOT = path.join(process.cwd(), "storage", "private");

let warned = false;
function key(): Buffer {
  const hex = process.env.STORAGE_ENCRYPTION_KEY;
  if (hex && /^[0-9a-f]{64}$/i.test(hex)) return Buffer.from(hex, "hex");
  if (process.env.NODE_ENV === "production") {
    throw new Error("STORAGE_ENCRYPTION_KEY (64 hex chars) is required in production");
  }
  if (!warned) {
    console.warn("[storage] STORAGE_ENCRYPTION_KEY not set - using an insecure dev key");
    warned = true;
  }
  return createHash("sha256").update("kidzstories-dev-only-key").digest();
}

function resolveKey(storageKey: string) {
  if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/.test(storageKey)) {
    throw new Error("Invalid storage key");
  }
  return path.join(ROOT, storageKey);
}

export function newStorageKey(ownerId: string, ext: string) {
  return `${ownerId}/${randomBytes(16).toString("hex")}.${ext}.enc`;
}

export async function putPrivate(storageKey: string, data: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(data), cipher.final()]);
  const file = resolveKey(storageKey);
  await mkdir(path.dirname(file), { recursive: true });
  // Layout: [12-byte IV][16-byte auth tag][ciphertext]
  await writeFile(file, Buffer.concat([iv, cipher.getAuthTag(), body]), { mode: 0o600 });
}

export async function getPrivate(storageKey: string): Promise<Buffer> {
  const raw = await readFile(resolveKey(storageKey));
  const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
}

export async function deletePrivate(storageKey: string) {
  await rm(resolveKey(storageKey), { force: true });
}

/** Detects the image type from magic bytes - never trust the client's MIME type. */
export function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: "image/png", ext: "png" };
  }
  if (buf.length >= 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}
