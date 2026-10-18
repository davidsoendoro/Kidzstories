import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-ink/5 bg-white/60">
      <div className="container-page flex flex-col gap-4 py-10 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Kidzstories. Made with care for little readers.</p>
        <nav className="flex gap-5">
          <Link href="/templates" className="hover:text-ink">Stories</Link>
          <Link href="/pricing" className="hover:text-ink">Pricing</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy & photos</Link>
        </nav>
      </div>
    </footer>
  );
}
