// Server-only helper (used by the API routes). Sends a plain text WhatsApp message
// to the shop owner through the WhatsApp Business Cloud API.
//
// Heads-up: Meta only allows free-form text to a number that has messaged your business
// number in the last 24 hours. For a fully hands-off setup, create an approved message
// template and swap the payload below — see README → "WhatsApp setup".

import { brand } from "@/config/brand";

const isPlaceholder = (v?: string) => !v || v.startsWith("your_");

export interface SendResult {
  sent: boolean;
  reason?: string;
}

export async function sendWhatsAppToOwner(body: string): Promise<SendResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  // Falls back to the number in brand.ts if the env var is missing.
  const to = (process.env.OWNER_WHATSAPP_NUMBER || brand.phoneIntl).replace(/\D/g, "");

  if (isPlaceholder(token) || isPlaceholder(phoneId)) {
    return { sent: false, reason: "WhatsApp API credentials are not set" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { preview_url: false, body },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { sent: false, reason: `WhatsApp API ${res.status}: ${detail.slice(0, 300)}` };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "WhatsApp request failed" };
  }
}
