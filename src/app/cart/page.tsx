"use client";

import Link from "next/link";
import { brand } from "@/config/brand";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import CartLine from "@/components/cart/CartLine";

export default function CartPage() {
  const { items, count, subtotal, hydrated, clearCart } = useCart();

  if (!hydrated) {
    return (
      <div className="container-site section-padding">
        <p className="text-lg text-brand-muted" role="status">
          {brand.copy.loading}
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-site section-padding text-center">
        <h1 className="page-title">Your cart</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-brand-dark">{brand.copy.emptyCart}</p>
        <Link href="/shop" className="btn-primary mt-6">
          {brand.copy.shopCollection}
        </Link>
      </div>
    );
  }

  return (
    // pb-28 leaves room for the sticky checkout bar on phones
    <div className="container-site section-padding pb-28 sm:pb-20">
      <div className="flex items-end justify-between gap-4">
        <h1 className="page-title">
          Your cart <span className="font-body text-brand-muted">({count})</span>
        </h1>
        <button type="button" onClick={clearCart} className="btn-ghost -mr-3 shrink-0">
          Clear all
        </button>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-brand-dark2 border-y border-brand-dark2">
          {items.map((item, index) => (
            <CartLine key={`${item.product.id}-${item.selected_size}-${index}`} item={item} />
          ))}
        </ul>

        <aside className="card h-fit p-5 lg:sticky lg:top-24">
          <h2 className="text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-dark">Subtotal</dt>
              <dd className="font-medium text-brand-black">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-dark">Delivery</dt>
              <dd className="text-brand-muted">At checkout</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-brand-muted">{brand.copy.fulfilmentBadge}</p>
          <div className="mt-4 flex items-baseline justify-between border-t border-brand-dark2 pt-4">
            <span className="text-brand-dark">Total so far</span>
            <span className="price text-2xl leading-none">{formatPrice(subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn-primary mt-5 hidden w-full sm:flex">
            Checkout
          </Link>
          <Link href="/shop" className="btn-ghost mt-2 w-full">
            Keep shopping
          </Link>
        </aside>
      </div>

      {/* Sticky checkout bar — phones only */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-brand-dark2 bg-brand-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div>
          <p className="price text-xl leading-none">{formatPrice(subtotal)}</p>
          <p className="mt-0.5 text-sm text-brand-muted">
            {count} {count === 1 ? "pair" : "pairs"}
          </p>
        </div>
        <Link href="/checkout" className="btn-primary ml-auto flex-1">
          Checkout
        </Link>
      </div>
    </div>
  );
}
