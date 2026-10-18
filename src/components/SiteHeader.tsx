import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "./Logo";

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-cream/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Kidzstories home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-semibold md:flex">
          <Link href="/templates" className="btn-ghost">Stories</Link>
          <Link href="/pricing" className="btn-ghost">Pricing</Link>
          <Link href="/privacy" className="btn-ghost">Privacy</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs font-semibold text-ink/60 sm:inline">
                {user.storyCredits} story · {user.videoCredits} video credits
              </span>
              <Link href="/orders" className="btn-ghost hidden sm:inline-flex">Orders</Link>
              <Link href="/dashboard" className="btn-secondary">My stories</Link>
              <form action={logout}>
                <button className="btn-ghost" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/signup" className="btn-primary">Start a story</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
