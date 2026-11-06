import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { getProductById } from "@/lib/products";
import { getMpesaConfig, sendStkPush } from "@/lib/mpesa";
import { sendWhatsAppToOwner } from "@/lib/whatsapp";
import {
  KENYA_COUNTIES,
  formatPrice,
  generateOrderId,
  getShippingFee,
  normalizeKenyanPhone,
} from "@/lib/utils";
import type { OrderRequest, OrderResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── tiny in-memory rate limiter ─────────────────────────────────────────────
// Stops someone hammering the endpoint (each call can trigger an M-Pesa prompt on a
// stranger's phone). Best-effort only: serverless instances don't share memory.
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > 6;
}

const clean = (v: unknown, max: number): string =>
  typeof v === "string" ? v.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

const fail = (status: number, message: string) =>
  NextResponse.json<OrderResponse>({ ok: false, error: message, message }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return fail(429, "Too many tries — give it a minute, or DM us to order.");

  let body: Partial<OrderRequest>;
  try {
    body = (await req.json()) as Partial<OrderRequest>;
  } catch {
    return fail(400, "That order didn't come through properly. Please try again.");
  }

  // ── validate customer ──
  const name = clean(body.customer?.name, 80);
  const phone = normalizeKenyanPhone(clean(body.customer?.phone, 20));
  const fulfilment = body.fulfilment === "pickup" || body.fulfilment === "delivery" ? body.fulfilment : null;
  const payment = body.payment === "mpesa" || body.payment === "on-delivery" ? body.payment : null;
  if (name.length < 2) return fail(400, "Please enter your name.");
  if (!phone) return fail(400, "Enter a valid Kenyan phone number, e.g. 0712 345 678.");
  if (!fulfilment || !payment) return fail(400, "Pick pickup or delivery, and how you'll pay.");

  const county = clean(body.customer?.county, 40);
  const town = clean(body.customer?.town, 80);
  const address = clean(body.customer?.address, 200);
  if (fulfilment === "delivery") {
    if (!(KENYA_COUNTIES as readonly string[]).includes(county)) return fail(400, "Choose your county.");
    if (town.length < 2 || address.length < 5) return fail(400, "Add your town and delivery address.");
  }

  // ── validate items; prices come from products.json, never from the browser ──
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
  if (rawItems.length === 0) return fail(400, "Your cart is empty.");

  const lines: { name: string; color: string; size: string; qty: number; total: number }[] = [];
  for (const it of rawItems) {
    const product = getProductById(String(it?.product_id));
    const size = clean(it?.selected_size, 4);
    const qty = Math.round(Number(it?.quantity));
    if (!product || !product.sizes.includes(size) || !(qty >= 1 && qty <= 10)) {
      return fail(400, "One of the items in your cart is no longer available. Please refresh and try again.");
    }
    if (!product.in_stock) return fail(400, `${product.name} is sold out for now.`);
    lines.push({ name: product.name, color: product.color, size, qty, total: product.price * qty });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.total, 0);
  const shipping = getShippingFee(county, fulfilment, subtotal);
  const total = subtotal + shipping;
  const orderId = generateOrderId();

  // ── payment ──
  let stkSent = false;
  let checkoutRequestId: string | undefined;

  if (payment === "mpesa") {
    const cfg = getMpesaConfig();
    if (!cfg) {
      if (process.env.NODE_ENV !== "production") {
        // Local dev with no Daraja keys: log the order so the whole checkout UI can still be tested.
        console.log("[orders] DEV MODE — M-Pesa not configured. Order:", { orderId, name, phone, lines, total });
        return NextResponse.json<OrderResponse>({
          ok: true, orderId, subtotal, shipping, total, stkSent: false, whatsappSent: false,
          message: "Dev mode: M-Pesa keys aren't set, so no prompt was sent. The order was logged in the terminal.",
        });
      }
      return fail(503, "M-Pesa isn't available right now. Choose pay on pickup/delivery, or DM us to order.");
    }
    const stk = await sendStkPush(cfg, { phone, amount: total, orderId });
    if (!stk.ok) {
      console.error("[orders] STK push failed:", stk.error);
      return fail(502, "We couldn't send the M-Pesa prompt. Check your number and try again, or choose pay on pickup/delivery.");
    }
    stkSent = true;
    checkoutRequestId = stk.checkoutRequestId;
  }

  // ── notify the owner on WhatsApp ──
  const fulfilmentLine =
    fulfilment === "pickup" ? `Pickup — ${brand.pickupLocation}` : `Delivery to ${county}, ${town}`;
  const paymentLine =
    payment === "mpesa"
      ? `M-Pesa STK Push sent to ${phone}${checkoutRequestId ? ` (ref ${checkoutRequestId})` : ""}`
      : "Pay on pickup / delivery";
  const message = [
    `👟 NEW ORDER — ${brand.name}`,
    "",
    `Order ID: ${orderId}`,
    "",
    "👤 Customer:",
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Fulfillment: ${fulfilmentLine}`,
    ...(fulfilment === "delivery" ? [`Address: ${address}`] : []),
    "",
    "🛍️ Items:",
    ...lines.map((l) => `• ${l.name} — ${l.color}, Size ${l.size} x${l.qty} — ${formatPrice(l.total)}`),
    "",
    `💰 Subtotal: ${formatPrice(subtotal)}`,
    `🚚 Delivery: ${fulfilment === "pickup" ? `N/A — ${brand.pickupLocation} Pickup` : formatPrice(shipping)}`,
    `💳 Total: ${formatPrice(total)}`,
    `📱 Payment: ${paymentLine}`,
    "",
    brand.copy.footerTagline,
    `Call/DM: ${brand.phone}`,
  ].join("\n");

  const wa = await sendWhatsAppToOwner(message);
  // Safety net: the order always lands in your server logs (Vercel → Logs) even if WhatsApp is down.
  console.log(`[orders] ${orderId} whatsapp=${wa.sent ? "sent" : `FAILED (${wa.reason})`}\n${message}`);

  // Nothing is stored anywhere else, so a pay-on-delivery order nobody was told about would be lost.
  if (!wa.sent && payment === "on-delivery" && process.env.NODE_ENV === "production") {
    return fail(502, "We couldn't reach the shop just now. Tap the WhatsApp button to place this order directly.");
  }

  return NextResponse.json<OrderResponse>({
    ok: true, orderId, subtotal, shipping, total, stkSent, whatsappSent: wa.sent, checkoutRequestId,
  });
}
