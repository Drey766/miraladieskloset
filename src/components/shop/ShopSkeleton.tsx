import { brand } from "@/config/brand";

/** Shown while the shop's filters read the URL (Suspense fallback). */
export default function ShopSkeleton() {
  return (
    <div className="container-site py-8" aria-busy="true">
      <h1 className="page-title">{brand.copy.sections.theLineup}</h1>
      <p role="status" className="mt-2 text-brand-muted">
        {brand.copy.loading}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={`sk-${i}`} className="animate-pulse">
            <div className="aspect-square rounded bg-brand-photo" />
            <div className="space-y-2 pt-3">
              <div className="h-3 w-1/3 rounded-sm bg-brand-dark2" />
              <div className="h-4 w-4/5 rounded-sm bg-brand-dark2" />
              <div className="h-4 w-1/2 rounded-sm bg-brand-dark2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
