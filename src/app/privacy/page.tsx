export const metadata = { title: "Privacy & photos" };

const POINTS = [
  ["Private by default", "Your child's photos, illustrations and videos are only visible to you while signed in. There are no public links and nothing is listed or indexed."],
  ["Encrypted at rest", "Every photo and illustration is encrypted with AES-256-GCM before it is written to storage."],
  ["Used only for your books", "Photos are used solely as a likeness reference when illustrating your child's stories. They are never used to train models, sold or shared for marketing."],
  ["You're in control", "Delete any photo at any time. Deleting a child profile removes their photos, stories and illustrations permanently."],
  ["Parental consent", "Only a parent or legal guardian may upload a child's photos. We ask you to confirm this on every upload."],
  ["Printing partners", "When you order a print, only the finished print file and shipping address are shared with our print partner - never the original photos."],
];

export default function PrivacyPage() {
  return (
    <section className="container-page max-w-3xl py-12">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-2 text-4xl font-bold">Your child's photos stay yours</h1>
      <div className="mt-8 grid gap-4">
        {POINTS.map(([title, body]) => (
          <div key={title} className="card">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-1 text-ink/70">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
