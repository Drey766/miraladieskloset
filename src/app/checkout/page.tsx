"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { brand } from "@/config/brand";
import { useCart } from "@/context/CartContext";
import { KENYA_COUNTIES, cn, formatPrice, getShippingFee, normalizeKenyanPhone, whatsappLink } from "@/lib/utils";
import { CheckIcon, PinIcon, TruckIcon, WhatsAppIcon } from "@/components/ui/Icons";
import type { CartItem, Fulfilment, OrderRequest, OrderResponse, PaymentMethod } from "@/types";

const FORM_ID = "checkout-form";
const copy = brand.copy.checkout;

type FieldName = "name" | "phone" | "county" | "town" | "address";

/** Snapshot of what was ordered, kept after the cart is cleared so the confirmation can still show it. */
interface Placed {
  orderId: string;
  items: CartItem[];
  fulfilment: Fulfilment;
  payment: PaymentMethod;
  subtotal: number;
  shipping: number;
  total: number;
  name: string;
  phone: string;
  county: string;
  town: string;
  address: string;
  stkSent: boolean;
  whatsappSent: boolean;
  note?: string;
}

/** The order as a WhatsApp message the customer can send to the shop themselves (fallback / extra confirmation). */
function orderMessage(p: Omit<Placed, "stkSent" | "whatsappSent" | "note"> | Placed): string {
  return [
    `👟 ORDER ${p.orderId} — ${brand.name}`,
    `Name: ${p.name}`,
    `Phone: ${p.phone}`,
    p.fulfilment === "pickup" ? `Pickup — ${brand.pickupLocation}` : `Delivery: ${p.town}, ${p.county} — ${p.address}`,
    "",
    ...p.items.map(
      (i) =>
        `• ${i.product.name} — ${i.product.color}, Size ${i.selected_size} x${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`
    ),
    "",
    `Total: ${formatPrice(p.total)} (${p.payment === "mpesa" ? "M-Pesa" : "pay on pickup/delivery"})`,
  ].join("\n");
}

export default function CheckoutPage() {
  const { items, subtotal, hydrated, clearCart } = useCart();

  const [fulfilment, setFulfilment] = useState<Fulfilment>("delivery");
  const [payment, setPayment] = useState<PaymentMethod>("mpesa");
  const [form, setForm] = useState({ name: "", phone: "", county: "Nairobi", town: "", address: "" });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const shipping = getShippingFee(form.county, fulfilment, subtotal);
  const total = subtotal + shipping;

  useEffect(() => {
    if (placed) window.scrollTo({ top: 0 });
  }, [placed]);

  const set = (field: FieldName) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  function validate(): boolean {
    const next: Partial<Record<FieldName, string>> = {};
    if (form.name.trim().length < 2) next.name = "Tell us your name.";
    if (!normalizeKenyanPhone(form.phone)) next.phone = "Enter a valid number, e.g. 0712 345 678.";
    if (fulfilment === "delivery") {
      if (!form.county) next.county = "Choose your county.";
      if (form.town.trim().length < 2) next.town = "Which town or estate?";
      if (form.address.trim().length < 5) next.address = "Add a street, building or landmark.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setServerError(null);
    if (!validate()) {
      // jump to the first thing that needs fixing
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus({ preventScroll: false })
      );
      return;
    }

    const phone = normalizeKenyanPhone(form.phone) as string;
    const payload: OrderRequest = {
      customer: {
        name: form.name.trim(),
        phone,
        ...(fulfilment === "delivery"
          ? { county: form.county, town: form.town.trim(), address: form.address.trim() }
          : {}),
      },
      fulfilment,
      payment,
      items: items.map((i) => ({ product_id: i.product.id, selected_size: i.selected_size, quantity: i.quantity })),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as OrderResponse;
      if (!res.ok || !data.ok || !data.orderId) {
        setServerError(data.message ?? "Something went wrong. Please try again, or DM us to order.");
        return;
      }
      setPlaced({
        orderId: data.orderId,
        items,
        fulfilment,
        payment,
        subtotal: data.subtotal ?? subtotal,
        shipping: data.shipping ?? shipping,
        total: data.total ?? total,
        name: payload.customer.name,
        phone,
        county: form.county,
        town: form.town.trim(),
        address: form.address.trim(),
        stkSent: !!data.stkSent,
        whatsappSent: !!data.whatsappSent,
        note: data.message,
      });
      clearCart();
    } catch {
      setServerError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ───────── confirmation ───────── */
  if (placed) {
    return (
      <div className="container-site section-padding">
        <div className="mx-auto max-w-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-black text-brand-white">
            <CheckIcon className="h-8 w-8" />
          </div>
          <h1 className="page-title mt-5">{brand.copy.orderConfirmed}</h1>
          <p className="mt-3 text-brand-dark">
            Order number: <span className="price whitespace-nowrap">{placed.orderId}</span>
          </p>

          <div className="card mt-6 space-y-3 p-5 text-brand-dark">
            {placed.payment === "mpesa" && placed.stkSent && (
              <p className="font-medium text-brand-black">{copy.mpesaPrompt}</p>
            )}
            {placed.payment === "on-delivery" && <p className="font-medium text-brand-black">{copy.payLater}</p>}
            {placed.note && <p className="text-brand-primary">{placed.note}</p>}
            {placed.fulfilment === "pickup" ? (
              <p>
                <span className="text-brand-black">{brand.pickupLocation} pickup.</span> {brand.pickupInstructions}
              </p>
            ) : (
              <p>
                <span className="text-brand-black">Delivering to {placed.town}, {placed.county}.</span>{" "}
                {brand.copy.deliveryExplainer}
              </p>
            )}
          </div>

          <ul className="mt-6 divide-y divide-brand-dark2 border-y border-brand-dark2 text-sm">
            {placed.items.map((i, index) => (
              <li key={`${i.product.id}-${i.selected_size}-${index}`} className="flex justify-between gap-4 py-3">
                <span className="text-brand-dark">
                  {i.product.name} · Size {i.selected_size} × {i.quantity}
                </span>
                <span className="shrink-0 text-brand-black">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
            <li className="flex justify-between py-3">
              <span className="text-brand-dark">
                {placed.fulfilment === "pickup" ? "Pickup" : "Delivery"}
              </span>
              <span className="text-brand-black">{placed.shipping === 0 ? "Free" : formatPrice(placed.shipping)}</span>
            </li>
            <li className="flex items-baseline justify-between py-3">
              <span className="text-brand-dark">Total</span>
              <span className="price text-2xl leading-none">{formatPrice(placed.total)}</span>
            </li>
          </ul>

          {/* Always offered: guarantees the shop gets the details even if the automatic WhatsApp ping didn't fire. */}
          <p className="mt-6 text-sm text-brand-dark">
            {placed.whatsappSent ? "Want to say hi or add a note?" : copy.confirmOnWhatsApp}
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappLink(orderMessage(placed))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {copy.sendOnWhatsApp}
            </a>
            <Link href="/shop" className="btn-outline">
              Keep shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ───────── loading / empty ───────── */
  if (!hydrated) {
    return (
      <div className="container-site section-padding">
        <p className="text-lg text-brand-muted" role="status">{brand.copy.loading}</p>
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="container-site section-padding text-center">
        <h1 className="page-title">{copy.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-brand-dark">{brand.copy.emptyCart}</p>
        <Link href="/shop" className="btn-primary mt-6">{brand.copy.shopCollection}</Link>
      </div>
    );
  }

  /* ───────── the form ───────── */
  const submitLabel = submitting ? brand.copy.loading : copy.placeOrder;

  return (
    <div className="container-site section-padding pb-28 sm:pb-20">
      <h1 className="page-title">{copy.title}</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-8">
          {/* 1 — how do you want it? */}
          <fieldset>
            <legend className="mb-4 font-display text-2xl text-brand-black"><span className="font-body">1.</span> {copy.stepFulfilment}</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pickup or delivery">
              <ChoiceCard
                selected={fulfilment === "pickup"}
                onSelect={() => setFulfilment("pickup")}
                icon={<PinIcon className="h-6 w-6" />}
                title={copy.pickupLabel}
                hint={copy.pickupHint}
              />
              <ChoiceCard
                selected={fulfilment === "delivery"}
                onSelect={() => setFulfilment("delivery")}
                icon={<TruckIcon className="h-6 w-6" />}
                title={copy.deliveryLabel}
                hint={copy.deliveryHint}
              />
            </div>
            {fulfilment === "pickup" && (
              <p className="mt-3 rounded-md bg-brand-light p-4 text-brand-dark">
                <span className="font-medium text-brand-black">{brand.pickupLocation}. </span>
                {brand.pickupInstructions}
              </p>
            )}
          </fieldset>

          {/* 2 — who are you? */}
          <fieldset className="space-y-4">
            <legend className="mb-4 font-display text-2xl text-brand-black"><span className="font-body">2.</span> {copy.stepDetails}</legend>
            <Field label="Full name" id="name" error={errors.name}>
              <input
                id="name" name="name" type="text" autoComplete="name" className="input"
                value={form.name} onChange={(e) => set("name")(e.target.value)}
                aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined}
              />
            </Field>
            <Field
              label="Phone (M-Pesa number)" id="phone" error={errors.phone}
              hint="Used for the M-Pesa prompt and to confirm your order."
            >
              <input
                id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678"
                className="input" value={form.phone} onChange={(e) => set("phone")(e.target.value)}
                aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
              />
            </Field>

            {fulfilment === "delivery" && (
              <>
                <Field label="County" id="county" error={errors.county}>
                  <select
                    id="county" name="county" autoComplete="address-level1" className="input"
                    value={form.county} onChange={(e) => set("county")(e.target.value)}
                    aria-invalid={!!errors.county} aria-describedby={errors.county ? "county-error" : undefined}
                  >
                    {KENYA_COUNTIES.map((c, index) => (
                      <option key={`${c}-${index}`} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Town / estate" id="town" error={errors.town}>
                  <input
                    id="town" name="town" type="text" autoComplete="address-level2" className="input"
                    value={form.town} onChange={(e) => set("town")(e.target.value)}
                    aria-invalid={!!errors.town} aria-describedby={errors.town ? "town-error" : undefined}
                  />
                </Field>
                <Field label="Delivery address" id="address" error={errors.address} hint="Street, building, landmark — the more detail the faster we find you.">
                  <textarea
                    id="address" name="address" rows={3} autoComplete="street-address" className="input"
                    value={form.address} onChange={(e) => set("address")(e.target.value)}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "address-error" : "address-hint"}
                  />
                </Field>
              </>
            )}
          </fieldset>

          {/* 3 — how do you pay? */}
          <fieldset>
            <legend className="mb-4 font-display text-2xl text-brand-black"><span className="font-body">3.</span> {copy.stepPayment}</legend>
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              <ChoiceCard
                row selected={payment === "mpesa"} onSelect={() => setPayment("mpesa")}
                title={copy.mpesaLabel} hint={copy.mpesaHint}
              />
              <ChoiceCard
                row selected={payment === "on-delivery"} onSelect={() => setPayment("on-delivery")}
                title={copy.onDeliveryLabel} hint={copy.onDeliveryHint}
              />
            </div>
            <p className="mt-3 text-sm text-brand-muted">{copy.paymentNote}</p>
          </fieldset>

          {serverError && (
            <div role="alert" className="rounded-md border border-brand-primary bg-brand-white p-4">
              <p className="font-medium text-brand-black">{serverError}</p>
              <a
                href={whatsappLink(
                  orderMessage({
                    orderId: "(new)", items, fulfilment, payment, subtotal, shipping, total,
                    name: form.name, phone: form.phone, county: form.county, town: form.town, address: form.address,
                  })
                )}
                target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-3"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {copy.sendOnWhatsApp}
              </a>
            </div>
          )}
        </form>

        {/* Order summary */}
        <aside className="card h-fit p-5 lg:sticky lg:top-24" aria-label="Order summary">
          <h2 className="text-2xl">Your order</h2>
          <ul className="mt-3 divide-y divide-brand-dark2 text-sm">
            {items.map((i, index) => (
              <li key={`${i.product.id}-${i.selected_size}-${index}`} className="flex justify-between gap-3 py-2.5">
                <span className="text-brand-dark">
                  {i.product.name}
                  <span className="block text-sm text-brand-muted">Size {i.selected_size} × {i.quantity}</span>
                </span>
                <span className="shrink-0 text-brand-black">{formatPrice(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-2 border-t border-brand-dark2 pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-dark">Subtotal</dt>
              <dd className="text-brand-black">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-dark">{fulfilment === "pickup" ? "Pickup" : "Delivery"}</dt>
              <dd className="text-brand-black">{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-brand-dark2 pt-3">
            <span className="text-brand-dark">Total</span>
            <span className="price text-2xl leading-none">{formatPrice(total)}</span>
          </div>
          <button type="submit" form={FORM_ID} disabled={submitting} className="btn-primary mt-5 hidden w-full sm:flex">
            {submitLabel}
          </button>
          <Link href="/cart" className="btn-ghost mt-2 w-full">Edit cart</Link>
        </aside>
      </div>

      {/* Sticky place-order bar — phones only */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brand-dark2 bg-brand-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div>
          <p className="price text-xl leading-none">{formatPrice(total)}</p>
          <p className="mt-0.5 text-sm text-brand-muted">{fulfilment === "pickup" ? "Pickup — free" : `+ ${formatPrice(shipping)} delivery`}</p>
        </div>
        <button type="submit" form={FORM_ID} disabled={submitting} className="btn-primary ml-auto flex-1">
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/* ───────── small pieces ───────── */

function Field({
  label, id, error, hint, children,
}: {
  label: string; id: string; error?: string; hint?: string; children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-primary">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="mt-1.5 text-sm text-brand-muted">{hint}</p>
      )}
    </div>
  );
}

function ChoiceCard({
  selected, onSelect, title, hint, icon, row,
}: {
  selected: boolean; onSelect: () => void; title: string; hint: string; icon?: ReactNode; row?: boolean;
}) {
  return (
    <button
      type="button" role="radio" aria-checked={selected} onClick={onSelect}
      className={cn(
        "flex min-h-[44px] w-full gap-3 rounded-lg border p-4 text-left transition-colors",
        row ? "items-start" : "flex-col",
        selected ? "border-brand-black bg-brand-light" : "border-brand-dark2 bg-brand-white hover:border-brand-black"
      )}
    >
      {icon && <span className={selected ? "text-brand-black" : "text-brand-muted"}>{icon}</span>}
      {row && (
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-brand-black" : "border-brand-muted"
          )}
          aria-hidden="true"
        >
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-black" />}
        </span>
      )}
      <span>
        <span className="block font-medium leading-snug text-brand-black">{title}</span>
        <span className="mt-1 block text-sm text-brand-dark">{hint}</span>
      </span>
    </button>
  );
}
