# Kidzstories

A web app for creating personalised, illustrated storybooks starring your child, built from hand-crafted templates.
Parents upload private photos, personalise the story within guardrails, read it online, turn it into a short video,
and order a high-quality printed copy.

## Product rules encoded in the app

| Rule | Where |
| --- | --- |
| **Stories come from templates** (4 included: Moon Mission, Whispering Forest, Under-the-Sea Birthday, Runaway Dino Egg) | `src/lib/templates/` |
| **Stories can be altered, but not far from the template.** Customers pick slot values (sidekick, colours, snacks…) or type short custom values, and can edit any page. Each edit must keep the page's anchor words and the child as hero, stay within 0.6–1.5× the original length, keep ≥55% of the original content words, and add no more than 14 new words. Unsafe words are blocked. The same check runs live in the editor and again on the server, and it also filters the AI personalisation. | `src/lib/story.ts` |
| **Photos are private.** Photos (and illustrations, which contain the child's likeness) are encrypted with AES-256-GCM, stored outside `public/`, served only to their owner with `no-store` and a sandboxing CSP, and type-checked by magic bytes. Uploads require a parent/guardian consent tick. Deleting a child deletes their photos, stories and illustrations. | `src/lib/storage.ts`, `src/app/api/photos`, `src/app/actions/children.ts` |
| **Pay per package**, which covers the gen-AI cost (story + video credits). Credits are spent atomically and refunded automatically if generation fails. | `src/lib/pricing.ts`, `src/app/actions/stories.ts`, `src/lib/generation.ts` |
| **Printing costs a small extra** (softcover $5.99 / hardcover $11.99 per copy + $4.99 shipping). A print-ready, 300 dpi PDF with 0.125" bleed is generated. Stories lock once a print order is paid. | `src/lib/pricing.ts`, `src/lib/pdf.ts` |
| **Short video generation** uses a video credit. | `src/lib/ai/video.ts`, `src/components/VideoPlayer.tsx` |

## Stack

Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS · Prisma (SQLite locally) · Stripe Checkout ·
Claude (`@anthropic-ai/sdk`) for text personalisation · pdf-lib + sharp for print files · Vitest.

## Getting started

```bash
npm install
cp .env.example .env          # then set STORAGE_ENCRYPTION_KEY=$(openssl rand -hex 32)
npm run setup                 # creates the SQLite DB and seeds a demo account
npm run dev
```

Demo login: `demo@kidzstories.test` / `password123` (3 story credits, 1 video credit, one child).

```bash
npm test        # guardrail + pricing unit tests
npm run lint    # typecheck
npm run build
```

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma connection string. Use Postgres in production (change `provider` in `prisma/schema.prisma`). |
| `STORAGE_ENCRYPTION_KEY` | 64 hex chars. **Required in production**; dev falls back to an insecure fixed key with a warning. |
| `ANTHROPIC_API_KEY` | Optional. When set, Claude lightly polishes each page for the child (`claude-opus-5-5`, structured output, server-side refusal fallback). Any page that fails the guardrails falls back to the template text. Without a key, stories are rendered straight from the template. |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Optional. Enables Stripe Checkout; point a webhook at `/api/stripe/webhook` for `checkout.session.completed`. Without them a mock checkout is used. |
| `ALLOW_MOCK_PAYMENTS` | Only for staging demos: allows the mock checkout in a production build. |
| `APP_URL` | Base URL for payment redirects. |

## Plugging in real image and video models

Illustrations and videos go through small provider interfaces. The bundled providers work offline so the whole flow runs locally:

- `src/lib/ai/images.ts` (`ImageProvider`): the placeholder draws an SVG scene from each template page's `scene` spec. A real provider receives the page prompt, palette, the child's description and decrypted reference photos (for likeness) and returns PNG/JPEG. Return it from `getImageProvider()`.
- `src/lib/ai/video.ts` (`VideoProvider`): the placeholder produces a storyboard that the in-app player animates (pans + captions). A real provider returns `video/mp4`, which the player streams instead.

## Production notes

- Generation runs in-process via `after()`. For scale, move `generateStory` / `generateVideo` onto a durable job queue.
- Swap `src/lib/storage.ts` for a private object-storage bucket (S3/GCS with KMS). The rest of the app only calls `putPrivate` / `getPrivate` / `deletePrivate`.
- Print fulfilment: paid `PrintOrder`s plus `/api/stories/:id/pdf` are what you send to a print partner (e.g. via their API), then update the order status to `in_production` / `shipped`.
