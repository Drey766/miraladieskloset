import type { CategorySlug } from "@/types";

/** Generic sneaker taxonomy (not brand-specific). Labels match the category table in the brief. */
export const CATEGORIES: Record<CategorySlug, { label: string; short: string; blurb: string }> = {
  running: { label: "Running Shoes", short: "Running", blurb: "Road, tempo, everyday miles." },
  skate: { label: "Skate Shoes", short: "Skate", blurb: "Flat soles, board feel." },
  court: { label: "Court Shoes", short: "Court", blurb: "Padel, tennis, badminton." },
  hiking: { label: "Hiking & Trail", short: "Hiking", blurb: "Grip for the rough stuff." },
  training: { label: "Training Shoes", short: "Training", blurb: "Gym days, sorted." },
  basketball: { label: "Basketball", short: "Basketball", blurb: "Ankle support, court grip." },
  walking: { label: "Walking Shoes", short: "Walking", blurb: "All-day city comfort." },
  lifestyle: { label: "Lifestyle Sneakers", short: "Lifestyle", blurb: "Everyday fits." },
};

/** Display order on the home page / filters. Categories with zero products are hidden automatically. */
export const CATEGORY_ORDER: CategorySlug[] = [
  "running",
  "skate",
  "court",
  "training",
  "hiking",
  "lifestyle",
  "basketball",
  "walking",
];
