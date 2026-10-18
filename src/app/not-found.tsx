import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page max-w-lg py-24 text-center">
      <h1 className="text-4xl font-bold">This page wandered off</h1>
      <p className="mt-3 text-ink/70">We couldn't find what you were looking for.</p>
      <Link href="/" className="btn-primary mt-6">Back home</Link>
    </div>
  );
}
