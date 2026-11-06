"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

/** Swipeable on phones (CSS scroll-snap), thumbnails on bigger screens. */
export default function ProductGallery({ product }: { product: Product }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // No external placeholder service — if a product somehow has zero photos, the
  // gallery just shows a plain branded tile instead of pinging a third party.
  const images = product.images;
  const hasPhotos = images.length > 0;
  const onSale = !!product.original_price && !!product.discount_percent;

  const onScroll = () => {
    const el = scroller.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goTo = (index: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div>
      <div className="relative overflow-hidden rounded bg-brand-photo">
        {hasPhotos ? (
          <div
            ref={scroller}
            onScroll={onScroll}
            role="region"
            aria-label={`${product.name} photos`}
            tabIndex={0}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {images.map((src, index) => (
              <div key={`${src}-${index}`} className="relative aspect-square w-full shrink-0 snap-center">
                <Image
                  src={src}
                  alt={`${product.name} — photo ${index + 1} of ${images.length}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex aspect-square w-full items-center justify-center bg-brand-photo">
            <span className="h-3 w-3 rounded-full bg-brand-mid" aria-hidden="true" />
          </div>
        )}

        {onSale && (
          <span className="badge-sale pointer-events-none absolute left-3 top-3 z-10">-{product.discount_percent}%</span>
        )}

        {images.length > 1 && (
          <p className="pointer-events-none absolute bottom-3 right-3 hidden rounded-sm bg-brand-white px-2 py-0.5 text-sm text-brand-black sm:block">
            {active + 1} / {images.length}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <>
          {/* Mobile: dots */}
          <div className="mt-3 flex justify-center gap-2 sm:hidden" aria-hidden="true">
            {images.map((_, index) => (
              <span
                key={`dot-${index}`}
                className={cn("h-0.5 w-6 transition-colors", index === active ? "bg-brand-black" : "bg-brand-mid")}
              />
            ))}
          </div>
          {/* Tablet/desktop: thumbnails */}
          <div className="mt-2 hidden grid-cols-7 gap-2 sm:grid">
            {images.map((src, index) => (
              <button
                key={`thumb-${src}-${index}`}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={cn(
                  "relative aspect-square overflow-hidden rounded border bg-brand-photo",
                  index === active ? "border-brand-black" : "border-brand-dark2 opacity-60 hover:opacity-100"
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
