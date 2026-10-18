import { describe, expect, it } from "vitest";
import { PACKAGES, PRINT_OPTIONS, printQuote, SHIPPING_CENTS } from "./pricing";

describe("pricing", () => {
  it("printing is a small add-on relative to the cheapest story package", () => {
    const cheapestStory = Math.min(...PACKAGES.filter((p) => p.storyCredits > 0).map((p) => p.priceCents / p.storyCredits));
    expect(PRINT_OPTIONS.softcover.perCopyCents).toBeLessThan(cheapestStory);
  });

  it("quotes totals and clamps quantity", () => {
    expect(printQuote("hardcover", 2)).toEqual({ quantity: 2, subtotalCents: 2398, shippingCents: SHIPPING_CENTS, totalCents: 2398 + SHIPPING_CENTS });
    expect(printQuote("softcover", 50).quantity).toBe(10);
    expect(printQuote("softcover", 0).quantity).toBe(1);
  });
});
