"use client";

import Link from "next/link";
import { brand } from "@/config/brand";
import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/shop/ProductCard";

export default function WishlistPage() {
  const { items, count, hydrated } = useWishlist();

  return (
    <div className="container-site section-padding">
      <h1 className="page-title">
        {brand.copy.sections.saved}{hydrated && count > 0 && <span className="font-body text-brand-muted"> ({count})</span>}
      </h1>

      {!hydrated ? (
        <p className="mt-6 text-lg text-brand-muted" role="status">
          {brand.copy.loading}
        </p>
      ) : items.length === 0 ? (
        <div className="mt-6 text-center sm:text-left">
          <p className="max-w-md text-lg text-brand-black">{brand.copy.emptyWishlist}</p>
          <Link href="/shop" className="btn-primary mt-6">
            {brand.copy.shopCollection}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, index) => (
            <ProductCard key={`${p.id}-${index}`} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
