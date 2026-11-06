"use client";

import { useEffect, useId, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CATEGORIES } from "@/lib/categories";
import { cn, formatPrice, prettyBrand, whatsappLink } from "@/lib/utils";
import { HeartIcon, WhatsAppIcon } from "@/components/ui/Icons";
import SizeGuide from "@/components/ui/SizeGuide";
import SizeSelector from "@/components/ui/SizeSelector";
import StarRating from "@/components/ui/StarRating";
import ProductGallery from "@/components/shop/ProductGallery";
import type { Product } from "@/types";

/** Gallery + buy box + the sticky mobile Add to Cart bar. Everything that shares the chosen size lives here. */
export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const sizeBlock = useRef<HTMLDivElement>(null);
  const sizeLabelId = useId();
  const saved = has(product.id);
  const onSale = !!product.original_price && !!product.discount_percent;

  // Clear the "pick a size" warning once they do.
  useEffect(() => {
    if (size) setSizeError(false);
  }, [size]);

  const handleAdd = () => {
    if (!product.in_stock) return;
    if (!size) {
      setSizeError(false);
      // re-trigger the shake animation
      requestAnimationFrame(() => setSizeError(true));
      sizeBlock.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addItem(product, size, 1);
  };

  return (
    <>
      <div className="grid gap-7 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-brand-muted">
            <span>{prettyBrand(product.brand)}</span>
            <span aria-hidden="true">/</span>
            <span>{CATEGORIES[product.category].short}</span>
            {product.is_new && <span className="badge-new ml-1">{brand.copy.badges.new}</span>}
            {product.is_clearance && <span className="badge-clearance ml-1">{brand.copy.badges.clearance}</span>}
          </div>

          {/* Jost, not the display face: product names often contain numbers, and Marcellus's 1 reads as an I. */}
          <h1 className="mt-2 font-body text-[1.875rem] leading-[1.2] tracking-normal text-brand-black sm:text-[2.25rem]">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="price text-[1.625rem] leading-none">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-lg text-brand-muted line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
            {onSale && <span className="badge-sale">Save {product.discount_percent}%</span>}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className="text-brand-dark">Colour: {product.color}</p>
            <StarRating rating={product.rating} count={product.review_count} />
          </div>

          {product.in_stock && product.low_stock && (
            <p className="mt-3 font-medium text-brand-primary">{brand.copy.lowStock}</p>
          )}
          {!product.in_stock && (
            <p className="mt-3 rounded-md bg-brand-light p-4 text-brand-dark">{brand.copy.outOfStock}</p>
          )}

          {/* Size chips */}
          <div ref={sizeBlock} className="mt-7 border-t border-brand-dark2 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <span id={sizeLabelId} className="font-medium text-brand-black">
                Size (EU){size ? `: ${size}` : ""}
              </span>
              <SizeGuide />
            </div>
            <SizeSelector
              sizes={product.sizes}
              value={size}
              onChange={setSize}
              invalid={sizeError}
              labelId={sizeLabelId}
            />
            {sizeError && (
              <p role="alert" className="mt-3 text-sm font-medium text-brand-primary">
                Pick your size first.
              </p>
            )}
          </div>

          {/* Desktop / tablet actions (the sticky bar handles phones) */}
          <div className="mt-6 hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="btn-primary flex-1"
            >
              {brand.copy.addToCart}
            </button>
            <WishlistButton saved={saved} onClick={() => toggle(product.id)} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-3 sm:block">
            <div className="sm:hidden">
              <WishlistButton saved={saved} onClick={() => toggle(product.id)} full />
            </div>
            <a
              href={whatsappLink(brand.copy.whatsappEnquiry(product.name, size ?? undefined))}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full !px-3"
            >
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              <span className="sm:hidden">{brand.copy.dmUs}</span>
              <span className="hidden sm:inline">{brand.copy.whatsappCtaButton}</span>
            </a>
          </div>

          <p className="mt-6 border-t border-brand-dark2 pt-5 text-brand-dark">{brand.copy.fulfilmentBadge}.</p>
          <p className="mt-3 max-w-prose leading-relaxed text-brand-dark">{product.description}</p>
          <p className="mt-3 text-sm text-brand-muted">SKU {product.sku}</p>
        </div>
      </div>

      {/* Sticky bottom bar — phones only */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-brand-dark2 bg-brand-white/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <div className="min-w-0">
          <p className="price text-lg leading-none">{formatPrice(product.price)}</p>
          <p className={cn("mt-1 truncate text-sm", size ? "text-brand-dark" : "text-brand-muted")}>
            {size ? `Size ${size}` : "Pick a size"}
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!product.in_stock}
          className="btn-primary ml-auto flex-1"
        >
          {brand.copy.addToCart}
        </button>
      </div>
    </>
  );
}

function WishlistButton({
  saved,
  onClick,
  full,
}: {
  saved: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={cn("btn-outline", full && "w-full !px-3")}
    >
      <HeartIcon filled={saved} className="h-5 w-5" />
      {saved ? brand.copy.saved : brand.copy.save}
    </button>
  );
}
