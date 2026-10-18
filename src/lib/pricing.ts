/**
 * Pricing model: customers pay up-front per package. The package price covers
 * the generative-AI cost of creating stories (and videos). Printing is a small
 * add-on that roughly covers print + handling, since most of the value has
 * already been paid for during generation.
 */
export type PackageId = "spark" | "storyteller" | "storyteller_video" | "video_addon";

export interface StoryPackage {
  id: PackageId;
  name: string;
  tagline: string;
  priceCents: number;
  storyCredits: number;
  videoCredits: number;
  features: string[];
  highlight?: boolean;
}

export const PACKAGES: StoryPackage[] = [
  {
    id: "spark",
    name: "Spark",
    tagline: "One magical story",
    priceCents: 1999,
    storyCredits: 1,
    videoCredits: 0,
    features: ["1 personalised story", "Up to 12 illustrated pages", "Unlimited guided edits", "Digital book + print-ready PDF"],
  },
  {
    id: "storyteller",
    name: "Storyteller",
    tagline: "A little library",
    priceCents: 4999,
    storyCredits: 3,
    videoCredits: 0,
    features: ["3 personalised stories", "Mix any templates & children", "Unlimited guided edits", "Digital books + print-ready PDFs"],
  },
  {
    id: "storyteller_video",
    name: "Storyteller + Video",
    tagline: "Stories that move",
    priceCents: 6999,
    storyCredits: 3,
    videoCredits: 2,
    features: ["3 personalised stories", "2 short animated story videos", "Unlimited guided edits", "Digital books + print-ready PDFs"],
    highlight: true,
  },
  {
    id: "video_addon",
    name: "Video add-on",
    tagline: "Bring an existing story to life",
    priceCents: 1499,
    storyCredits: 0,
    videoCredits: 1,
    features: ["1 short animated video", "Narrated from your story", "Share with family"],
  },
];

export function getPackage(id: string): StoryPackage | undefined {
  return PACKAGES.find((p) => p.id === id);
}

export type PrintFormat = "softcover" | "hardcover";

export const PRINT_OPTIONS: Record<PrintFormat, { label: string; perCopyCents: number; description: string }> = {
  softcover: { label: "Softcover", perCopyCents: 599, description: "8.5\" square, matte cover, premium 170gsm paper" },
  hardcover: { label: "Hardcover", perCopyCents: 1199, description: "8.5\" square, laminated hardcover, lay-flat binding" },
};

export const SHIPPING_CENTS = 499;
export const MAX_PRINT_QUANTITY = 10;

export function printQuote(format: PrintFormat, quantity: number) {
  const q = Math.min(Math.max(Math.floor(quantity), 1), MAX_PRINT_QUANTITY);
  const subtotal = PRINT_OPTIONS[format].perCopyCents * q;
  return { quantity: q, subtotalCents: subtotal, shippingCents: SHIPPING_CENTS, totalCents: subtotal + SHIPPING_CENTS };
}

export function formatMoney(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
