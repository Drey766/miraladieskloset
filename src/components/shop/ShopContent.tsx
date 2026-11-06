"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { CATEGORIES } from "@/lib/categories";
import {
  DEFAULT_FILTERS,
  GENDERS,
  PRICE_RANGES,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  buildQuery,
  parseFilters,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { products } from "@/lib/products";
import { prettyBrand, whatsappLink } from "@/lib/utils";
import { CloseIcon, FilterIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/Icons";
import FilterSheet, { FilterPanel } from "@/components/shop/FilterSheet";
import ProductCard from "@/components/shop/ProductCard";

/**
 * Filter state lives here and is mirrored to the URL (so /shop?category=running links work
 * and results are shareable). Everything is filtered in memory — instant, no API, no debounce.
 */
export default function ShopContent() {
  const searchParams = useSearchParams();
  const urlString = searchParams.toString();

  const [filters, setFilters] = useState<Filters>(() => parseFilters(searchParams));
  const [sheetOpen, setSheetOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const latest = useRef(filters);
  latest.current = filters;

  // URL changed from outside (footer link, category card, back button) → adopt it.
  useEffect(() => {
    const fromUrl = parseFilters(new URLSearchParams(urlString));
    if (buildQuery(fromUrl) !== buildQuery(latest.current)) setFilters(fromUrl);
  }, [urlString]);

  // Our own changes → write to the URL without a server round-trip.
  useEffect(() => {
    const query = buildQuery(filters);
    if (query !== window.location.search) {
      window.history.replaceState(null, "", `${window.location.pathname}${query}`);
    }
  }, [filters]);

  // Navbar search icon links to /shop#search
  useEffect(() => {
    if (window.location.hash === "#search") searchInput.current?.focus();
  }, []);

  const update = useCallback((patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch })), []);
  const reset = useCallback(() => setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort })), []);

  const results = useMemo(() => applyFilters(products, filters), [filters]);
  const activeCount = activeFilterCount(filters);

  // Removable chips for whatever's active
  const chips: { key: string; label: string; clear: Partial<Filters> }[] = [];
  if (filters.category) chips.push({ key: "category", label: CATEGORIES[filters.category].short, clear: { category: "" } });
  if (filters.brand) chips.push({ key: "brand", label: prettyBrand(filters.brand), clear: { brand: "" } });
  if (filters.gender) chips.push({ key: "gender", label: GENDERS.find((g) => g.value === filters.gender)?.label ?? filters.gender, clear: { gender: "" } });
  if (filters.size) chips.push({ key: "size", label: `Size ${filters.size}`, clear: { size: "" } });
  if (filters.price) chips.push({ key: "price", label: PRICE_RANGES.find((r) => r.id === filters.price)?.label ?? "", clear: { price: "" } });
  if (filters.sale) chips.push({ key: "sale", label: "On sale", clear: { sale: false } });

  return (
    <div className="container-site pb-16 pt-8 sm:pb-24 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="page-title">{brand.copy.sections.theLineup}</h1>
        <p className="pb-1 text-sm text-brand-muted" role="status" aria-live="polite">
          {results.length} {results.length === 1 ? "pair" : "pairs"}
        </p>
      </div>

      {/* Search + filter button + sort */}
      <div id="search" className="mt-5 flex flex-wrap gap-2 sm:flex-nowrap">
        <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-muted" />
          <input
            ref={searchInput}
            type="search"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={brand.copy.searchPlaceholder}
            aria-label="Search sneakers"
            className="input pl-11"
          />
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="input flex !w-auto min-w-0 flex-1 basis-0 cursor-pointer items-center justify-center gap-2 font-medium sm:flex-none sm:basis-auto lg:hidden"
        >
          <FilterIcon className="h-5 w-5" />
          Filters{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as SortKey })}
          aria-label="Sort by"
          className="input !w-auto min-w-0 flex-1 basis-0 sm:flex-none sm:basis-auto"
        >
          {SORT_OPTIONS.map((o, index) => (
            <option key={`${o.value}-${index}`} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 lg:grid lg:grid-cols-[250px_1fr] lg:gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">Filters</h2>
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="btn-ghost text-brand-dark underline underline-offset-2">
                  Reset
                </button>
              )}
            </div>
            <FilterPanel filters={filters} onChange={update} />
          </div>
        </aside>

        <div>
          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {chips.map((chip, index) => (
                <button
                  key={`${chip.key}-${index}`}
                  type="button"
                  onClick={() => update(chip.clear)}
                  aria-label={`Remove filter: ${chip.label}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-brand-black px-3 text-sm font-medium text-brand-black hover:bg-brand-black hover:text-brand-white"
                >
                  {chip.label}
                  <CloseIcon className="h-4 w-4" />
                </button>
              ))}
              <button type="button" onClick={reset} className="btn-ghost text-brand-dark underline underline-offset-2">
                Clear all
              </button>
            </div>
          )}

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {results.map((p, index) => (
                <ProductCard key={`${p.id}-${index}`} product={p} priority={index < 4} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-start gap-4 p-6 sm:p-8">
              <p className="max-w-md text-lg text-brand-black">{brand.copy.noResults}</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="btn-primary">
                  Clear filters
                </button>
                <a
                  href={whatsappLink(
                    filters.q
                      ? `Hi! I'm looking for "${filters.q}". Do you have it?`
                      : brand.copy.whatsappGeneral
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {brand.copy.dmUs}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onReset={reset}
        resultCount={results.length}
        filters={filters}
        onChange={update}
      />
    </div>
  );
}
