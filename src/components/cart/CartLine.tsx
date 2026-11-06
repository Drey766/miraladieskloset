"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { primaryImage } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import type { CartItem } from "@/types";

/** One cart line: photo, name, size, quantity stepper (44px targets), line total, remove. */
export default function CartLine({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, selected_size, quantity } = item;
  const step = "flex h-11 w-11 items-center justify-center text-brand-black hover:bg-brand-dark2 disabled:opacity-40";

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/shop/${product.slug}`}
        className="photo-tile h-24 w-24 shrink-0 sm:h-28 sm:w-28"
        aria-label={`View ${product.name}`}
      >
        <Image
          src={primaryImage(product)}
          alt={product.name}
          fill
          sizes="112px"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/shop/${product.slug}`}
              className="-my-3 block line-clamp-2 py-3 leading-snug text-brand-black hover:text-brand-primary"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 text-sm text-brand-muted">
              Size {selected_size} · {product.color}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(product.id, selected_size)}
            aria-label={`Remove ${product.name}, size ${selected_size}`}
            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center text-brand-muted hover:text-brand-primary"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-2">
          <div className="flex items-center rounded-full border border-brand-mid bg-brand-white">
            <button
              type="button"
              className={step}
              onClick={() => updateQuantity(product.id, selected_size, quantity - 1)}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium text-brand-black" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              className={step}
              onClick={() => updateQuantity(product.id, selected_size, quantity + 1)}
              disabled={quantity >= 10}
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <p className="price text-base leading-none">
            {formatPrice(product.price * quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
