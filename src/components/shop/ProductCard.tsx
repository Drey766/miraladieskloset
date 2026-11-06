"use client";

import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { useWishlist } from "@/context/WishlistContext";
import { primaryImage } from "@/lib/products";
import { cn, formatPrice } from "@/lib/utils";
import { HeartIcon } from "@/components/ui/Icons";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  /** Mark above-the-fold cards so their image loads first. */
  priority?: boolean;
  className?: string;
}

/** The one tag worth showing on the photo, most useful first. */
function cardBadge(product: Product) {
  const { badges } = brand.copy;
  if (!product.in_stock) return <span className="badge-soldout">{badges.soldOut}</span>;
  if (product.original_price && product.discount_percent) {
    return <span className="badge-sale">-{product.discount_percent}%</span>;
  }
  if (product.low_stock) return <span className="badge-lowstock">{badges.lowStock}</span>;
  if (product.is_new) return <span className="badge-new">{badges.new}</span>;
  if (product.is_clearance) return <span className="badge-clearance">{badges.clearance}</span>;
  return null;
}

export default function ProductCard({ product, priority, className }: ProductCardProps) {
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const badge = cardBadge(product);

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link
        href={`/shop/${product.slug}`}
        className="flex flex-1 flex-col"
        aria-label={`${product.name}, ${formatPrice(product.price)}`}
      >
        <div className="photo-tile aspect-square">
          <Image
            src={primaryImage(product)}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn(!product.in_stock && "opacity-40")}
          />
          {badge && <div className="absolute left-2 top-2 z-10 flex">{badge}</div>}
        </div>

        <div className="flex flex-1 flex-col pt-3">
          <h3 className="line-clamp-2 min-h-[2.75em] text-[0.9375rem] font-normal leading-snug text-brand-black sm:text-base">
            {product.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
            <span className="price text-base sm:text-[1.0625rem]">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-sm text-brand-muted line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Sibling of the link (not inside it) so tapping the heart never navigates */}
      <button
        type="button"
        onClick={() => toggle(product.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from saved pairs` : `Save ${product.name}`}
        title={saved ? brand.copy.saved : brand.copy.save}
        className={cn(
          "absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center transition-colors",
          saved ? "text-brand-primary" : "text-brand-black hover:text-brand-primary"
        )}
      >
        <HeartIcon filled={saved} className="h-5 w-5" />
      </button>
    </article>
  );
}
