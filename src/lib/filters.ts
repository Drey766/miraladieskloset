import { CATEGORIES } from "@/lib/categories";
import { matchesGender } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import type { CategorySlug, Gender, Product } from "@/types";

export type SortKey = "newest" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
  { value: "rating", label: "Rating" },
];

export const PRICE_RANGES = [
  { id: "0-3000", min: 0, max: 3000, label: `Under ${formatPrice(3000)}` },
  { id: "3000-6000", min: 3000, max: 6000, label: `${formatPrice(3000)} – ${formatPrice(6000)}` },
  { id: "6000-10000", min: 6000, max: 10000, label: `${formatPrice(6000)} – ${formatPrice(10000)}` },
  { id: "10000-999999", min: 10000, max: 999999, label: `Over ${formatPrice(10000)}` },
] as const;

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "kids", label: "Kids" },
];

export interface Filters {
  q: string;
  category: CategorySlug | "";
  brand: string;
  gender: Gender | "";
  size: string;
  price: string; // a PRICE_RANGES id, or ""
  sale: boolean;
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  q: "",
  category: "",
  brand: "",
  gender: "",
  size: "",
  price: "",
  sale: false,
  sort: "newest",
};

interface ParamReader {
  get(name: string): string | null;
}

/** URL → filters. Unknown values are ignored so a hand-edited URL can't break the page. */
export function parseFilters(params: ParamReader): Filters {
  const category = params.get("category") ?? "";
  const gender = params.get("gender") ?? "";
  const sort = params.get("sort") ?? "";
  const price = params.get("price") ?? "";
  return {
    q: params.get("q") ?? "",
    category: category in CATEGORIES ? (category as CategorySlug) : "",
    brand: params.get("brand") ?? "",
    gender: GENDERS.some((g) => g.value === gender) ? (gender as Gender) : "",
    size: /^\d{2}$/.test(params.get("size") ?? "") ? (params.get("size") as string) : "",
    price: PRICE_RANGES.some((p) => p.id === price) ? price : "",
    sale: params.get("sale") === "1",
    sort: SORT_OPTIONS.some((s) => s.value === sort) ? (sort as SortKey) : "newest",
  };
}

/** Filters → "?category=running&sale=1" (or "" when everything is default). */
export function buildQuery(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q.trim()) p.set("q", f.q);
  if (f.category) p.set("category", f.category);
  if (f.brand) p.set("brand", f.brand);
  if (f.gender) p.set("gender", f.gender);
  if (f.size) p.set("size", f.size);
  if (f.price) p.set("price", f.price);
  if (f.sale) p.set("sale", "1");
  if (f.sort !== "newest") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: Filters): number {
  return [f.category, f.brand, f.gender, f.size, f.price].filter(Boolean).length + (f.sale ? 1 : 0);
}

/** Everything happens in memory with plain .filter() — instant, no API, no debounce. */
export function applyFilters(list: Product[], f: Filters): Product[] {
  const tokens = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const range = PRICE_RANGES.find((r) => r.id === f.price);

  const result = list.filter((p) => {
    if (tokens.length) {
      const haystack = `${p.name} ${p.brand} ${p.color} ${p.gender} ${CATEGORIES[p.category].label}`.toLowerCase();
      if (!tokens.every((t) => haystack.includes(t))) return false;
    }
    if (f.category && p.category !== f.category) return false;
    if (f.brand && p.brand !== f.brand) return false;
    if (f.gender && !matchesGender(p, f.gender)) return false;
    if (f.size && !p.sizes.includes(f.size)) return false;
    if (range && (p.price < range.min || p.price >= range.max)) return false;
    if (f.sale && !p.original_price) return false;
    return true;
  });

  const byId = (a: Product, b: Product) => Number(a.id) - Number(b.id);
  switch (f.sort) {
    case "price-asc":
      return result.sort((a, b) => a.price - b.price || byId(a, b));
    case "price-desc":
      return result.sort((a, b) => b.price - a.price || byId(a, b));
    case "rating":
      return result.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
    default:
      // "Newest": flagged-new first, then catalogue order (earlier = newer in the source list).
      return result.sort((a, b) => Number(b.is_new) - Number(a.is_new) || byId(a, b));
  }
}
