import { brand } from "@/config/brand";
import type { Fulfilment } from "@/types";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 2950 -> "KSh 2,950". Manual grouping so server and client always render identically. */
export function formatPrice(amount: number): string {
  const n = Math.round(amount);
  return `${brand.currency} ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2025-08-10" -> "10 Aug 2025" (no Intl, so no hydration mismatches). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** ["36",…,"46"] -> "36–46" */
export function sizeRangeLabel(sizes: string[]): string {
  if (sizes.length === 0) return "";
  const nums = sizes.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return sizes.join(", ");
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `${min}` : `${min}–${max}`;
}

export const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
] as const;

/**
 * Delivery fee in KES. Zones and prices live in brand.shipping.
 * Pickup is always free.
 */
export function getShippingFee(
  county: string,
  fulfilment: Fulfilment,
  subtotal = 0
): number {
  if (fulfilment === "pickup") return 0;
  const { nairobi, nairobiMetro, upcountry, nairobiMetroCounties, freeDeliveryOver } =
    brand.shipping;
  if (freeDeliveryOver > 0 && subtotal >= freeDeliveryOver) return 0;
  if (county === "Nairobi") return nairobi;
  if ((nairobiMetroCounties as readonly string[]).includes(county)) return nairobiMetro;
  return upcountry;
}

/**
 * Turn 0712 345 678 / 0112345678 / +254712345678 / 254712345678
 * into 254712345678. Returns null if it isn't a valid Safaricom-style number.
 */
export function normalizeKenyanPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  let intl = digits;
  if (digits.startsWith("0")) intl = `254${digits.slice(1)}`;
  else if (digits.startsWith("7") || digits.startsWith("1")) intl = `254${digits}`;
  return /^254[71]\d{8}$/.test(intl) ? intl : null;
}

/** wa.me link to the shop's WhatsApp with a pre-filled message. */
export function whatsappLink(text?: string): string {
  return text ? `${brand.whatsappUrl}?text=${encodeURIComponent(text)}` : brand.whatsappUrl;
}

/** e.g. "SNE-1758345600000" — prefix comes from brand.shortName. */
export function generateOrderId(): string {
  const prefix = brand.shortName.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  return `${prefix}-${Date.now()}`;
}

/** "#FF4D00" -> "255 77 0" (used for rgba() glows in CSS). */
export function hexToRgbTriplet(hex: string): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/** "KIPRUN" -> "Kiprun". The catalogue stores brands in caps, which shout on the page. */
export function prettyBrand(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/** "primaryLight" -> "primary-light" */
export function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
