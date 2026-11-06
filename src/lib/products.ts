import productsData from "@/data/products.json";
import type { CategorySlug, Gender, Product } from "@/types";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";

/** All products, straight from src/data/products.json. */
export const products = productsData as unknown as Product[];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.is_featured).slice(0, limit);
}

/** Same category first, then anything else, never the product itself. */
export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const same = products.filter((p) => p.id !== product.id && p.category === product.category);
  if (same.length >= limit) return same.slice(0, limit);
  const others = products.filter((p) => p.id !== product.id && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export function getBrands(): string[] {
  return Array.from(new Set(products.map((p) => p.brand))).sort();
}

export interface ActiveCategory {
  slug: CategorySlug;
  label: string;
  short: string;
  blurb: string;
  count: number;
  image?: string;
}

/** Categories that actually have products, in display order, each with a cover image. */
export function getActiveCategories(): ActiveCategory[] {
  return CATEGORY_ORDER.flatMap((slug) => {
    const inCat = products.filter((p) => p.category === slug);
    if (inCat.length === 0) return [];
    const cover = inCat.find((p) => p.is_featured) ?? inCat[0];
    return [{ slug, ...CATEGORIES[slug], count: inCat.length, image: cover.images[0] }];
  });
}

/** Does this product suit the chosen gender filter? Unisex shoes suit men AND women. */
export function matchesGender(product: Product, gender: Gender): boolean {
  if (gender === "unisex") return product.gender === "unisex";
  return product.gender === gender || product.gender === "unisex";
}

// A single transparent pixel — next/image needs a non-empty, valid src, and this
// avoids ever depending on an external placeholder service.
const BLANK_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";

export function primaryImage(product: Product): string {
  // No external placeholder service. In this catalogue every product has at least
  // one real photo, so this only matters if that ever stops being true.
  return product.images[0] ?? BLANK_PIXEL;
}
