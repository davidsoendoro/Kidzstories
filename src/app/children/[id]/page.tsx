import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteChild, deletePhoto, updateChild, uploadPhotos } from "@/app/actions/children";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ChildForm } from "@/components/ChildForm";
import { PhotoUploader } from "@/components/PhotoUploader";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const MAX_PHOTOS = 6;

export default async function ChildPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { welcome } = await searchParams;
  const child = await db.child.findFirst({ where: { id, userId: user.id }, include: { photos: { orderBy: { createdAt: "asc" } } } });
  if (!child) notFound();

  return (
    <div className="container-page py-10">
      <Link href="/dashboard" className="btn-ghost -ml-4">← My stories</Link>
      <h1 className="mt-2 text-4xl font-bold">{child.name}</h1>
      {welcome && <p className="mt-3 text-ink/70">Lovely! Now add a few photos so the illustrations look like {child.name}.</p>}

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold">Private photos</h2>
          <p className="mt-1 text-sm text-ink/60">Only you can see these. 🔒 Encrypted at rest.</p>
          {child.photos.length > 0 && (
            <ul className="mt-5 grid grid-cols-3 gap-3">
              {child.photos.map((p) => (
                <li key={p.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream">
                  {/* eslint-disable-next-line @next/next/no-img-element -- private, auth-gated image; must not go through the public image optimiser */}
                  <img src={`/api/photos/${p.id}`} alt={`Photo of ${child.name}`} className="h-full w-full object-cover" />
                  <form action={deletePhoto.bind(null, p.id)} className="absolute right-2 top-2">
                    <ConfirmButton message="Delete this photo permanently?" className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-red-700 shadow">Delete</ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6">
            <PhotoUploader action={uploadPhotos.bind(null, child.id)} remaining={MAX_PHOTOS - child.photos.length} />
          </div>
        </section>

        <section className="space-y-8">
          <div className="card">
            <h2 className="text-xl font-bold">Details</h2>
            <div className="mt-4">
              <ChildForm action={updateChild.bind(null, child.id)} initial={child} submitLabel="Save details" />
            </div>
          </div>
          <div className="card flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Ready for a story?</h2>
              <p className="text-sm text-ink/60">Pick a template and make it {child.name}'s.</p>
            </div>
            <Link href={`/stories/new?child=${child.id}`} className="btn-primary">Create a story</Link>
          </div>
          <form action={deleteChild.bind(null, child.id)} className="text-right">
            <ConfirmButton message={`Permanently delete ${child.name}, all photos and all stories? This can't be undone.`}>Delete {child.name}, their photos and stories</ConfirmButton>
          </form>
        </section>
      </div>
    </div>
  );
}
