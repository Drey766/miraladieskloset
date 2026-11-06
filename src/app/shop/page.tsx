import type { Metadata } from "next";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import ShopContent from "@/components/shop/ShopContent";
import ShopSkeleton from "@/components/shop/ShopSkeleton";

export const metadata: Metadata = {
  title: brand.copy.sections.theLineup,
  description: `Browse every pair — sizes ${brand.sizeRange.min}–${brand.sizeRange.max}. ${brand.copy.fulfilmentBadge}`,
};

// useSearchParams() (inside ShopContent) needs a Suspense boundary so the page can be prerendered.
export default function ShopPage() {
  return (
    <Suspense fallback={<ShopSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
