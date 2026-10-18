"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/auth";
import { formatMoney, MAX_PRINT_QUANTITY, PRINT_OPTIONS, printQuote, type PrintFormat } from "@/lib/pricing";
import { FormMessage } from "./FormMessage";
import { SubmitButton } from "./SubmitButton";

const COUNTRIES = [["US", "United States"], ["CA", "Canada"], ["GB", "United Kingdom"], ["IE", "Ireland"], ["AU", "Australia"], ["NZ", "New Zealand"], ["DE", "Germany"], ["FR", "France"], ["NL", "Netherlands"], ["ID", "Indonesia"], ["SG", "Singapore"]];

export function PrintOrderForm({ action, defaultName }: { action: (s: FormState, f: FormData) => Promise<FormState>; defaultName: string }) {
  const [state, formAction] = useActionState(action, undefined);
  const [format, setFormat] = useState<PrintFormat>("hardcover");
  const [quantity, setQuantity] = useState(1);
  const quote = printQuote(format, quantity);

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-6">
        <fieldset className="card">
          <legend className="sr-only">Format</legend>
          <h2 className="text-xl font-bold">Choose a format</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(PRINT_OPTIONS) as PrintFormat[]).map((f) => (
              <label key={f} className="cursor-pointer">
                <input type="radio" name="format" value={f} checked={format === f} onChange={() => setFormat(f)} className="peer sr-only" />
                <div className="h-full rounded-2xl p-4 ring-2 ring-ink/10 peer-checked:bg-sun/15 peer-checked:ring-sun">
                  <p className="font-bold">{PRINT_OPTIONS[f].label} · {formatMoney(PRINT_OPTIONS[f].perCopyCents)}</p>
                  <p className="mt-1 text-sm text-ink/60">{PRINT_OPTIONS[f].description}</p>
                </div>
              </label>
            ))}
          </div>
          <label className="label mt-5" htmlFor="quantity">Copies</label>
          <input id="quantity" name="quantity" type="number" min={1} max={MAX_PRINT_QUANTITY} value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 1)} className="input w-28" />
          <p className="mt-1 text-xs text-ink/50">Grandparents love a copy too.</p>
        </fieldset>

        <fieldset className="card space-y-4">
          <h2 className="text-xl font-bold">Shipping address</h2>
          <div><label className="label" htmlFor="shipName">Recipient</label><input className="input" id="shipName" name="shipName" defaultValue={defaultName} autoComplete="name" required /></div>
          <div><label className="label" htmlFor="shipLine1">Address</label><input className="input" id="shipLine1" name="shipLine1" autoComplete="address-line1" required /></div>
          <div><label className="label" htmlFor="shipLine2">Apartment, suite (optional)</label><input className="input" id="shipLine2" name="shipLine2" autoComplete="address-line2" /></div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="label" htmlFor="shipCity">City</label><input className="input" id="shipCity" name="shipCity" autoComplete="address-level2" required /></div>
            <div><label className="label" htmlFor="shipPostal">Postal code</label><input className="input" id="shipPostal" name="shipPostal" autoComplete="postal-code" required /></div>
            <div>
              <label className="label" htmlFor="shipCountry">Country</label>
              <select className="input" id="shipCountry" name="shipCountry" defaultValue="US" autoComplete="country">
                {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
      </div>

      <aside className="card h-fit space-y-3 lg:sticky lg:top-24">
        <h2 className="text-xl font-bold">Order summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt>{PRINT_OPTIONS[format].label} × {quote.quantity}</dt><dd>{formatMoney(quote.subtotalCents)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{formatMoney(quote.shippingCents)}</dd></div>
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-bold"><dt>Total</dt><dd>{formatMoney(quote.totalCents)}</dd></div>
        </dl>
        <p className="text-xs text-ink/60">Your story was already paid for with your package - you only pay for printing and delivery. Once paid, the story is locked for printing.</p>
        <FormMessage state={state} />
        <SubmitButton className="btn-primary w-full py-3" pendingText="Preparing checkout...">Continue to payment</SubmitButton>
      </aside>
    </form>
  );
}
