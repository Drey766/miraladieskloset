"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { useCart } from "@/context/CartContext";
import { useEscape, useLockBodyScroll } from "@/lib/hooks";
import { cn, formatPrice } from "@/lib/utils";
import CartLine from "@/components/cart/CartLine";
import { CloseIcon } from "@/components/ui/Icons";

/** Slide-in mini cart. Opens when something is added, or from the bag icon in the navbar. */
export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, count } = useCart();
  const pathname = usePathname();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(isOpen);
  useEscape(isOpen, closeCart);

  useEffect(() => {
    closeCart();
  }, [pathname, closeCart]);

  useEffect(() => {
    if (isOpen) closeBtn.current?.focus();
  }, [isOpen]);

  return (
    <div
      className={cn("fixed inset-0 z-[70] transition-[visibility] duration-300", isOpen ? "visible" : "invisible")}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-brand-dark2 bg-brand-white transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-dark2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h2 className="py-3 text-2xl">Your cart {count > 0 && <span className="font-body text-brand-muted">({count})</span>}</h2>
          <button
            ref={closeBtn}
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-brand-muted hover:text-brand-black"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="max-w-xs text-lg text-brand-black">{brand.copy.emptyCart}</p>
            <Link href="/shop" onClick={closeCart} className="btn-primary">
              {brand.copy.shopCollection}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-brand-dark2 overflow-y-auto px-4">
              {items.map((item, index) => (
                <CartLine key={`${item.product.id}-${item.selected_size}-${index}`} item={item} />
              ))}
            </ul>
            <div className="space-y-3 border-t border-brand-dark2 bg-brand-light p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-baseline justify-between">
                <span className="text-brand-dark">Subtotal</span>
                <span className="price text-xl">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-sm text-brand-muted">Delivery is worked out at checkout. {brand.pickupLocation} pickup is free.</p>
              <Link href="/checkout" className="btn-primary w-full">
                Checkout
              </Link>
              <Link href="/cart" className="btn-outline w-full">
                View cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
