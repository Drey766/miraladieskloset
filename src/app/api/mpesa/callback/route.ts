import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { formatPrice } from "@/lib/utils";
import { sendWhatsAppToOwner } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CallbackItem {
  Name: string;
  Value?: string | number;
}
interface StkCallback {
  MerchantRequestID?: string;
  CheckoutRequestID?: string;
  ResultCode?: number;
  ResultDesc?: string;
  CallbackMetadata?: { Item?: CallbackItem[] };
}

/**
 * Safaricom POSTs here after the customer accepts, rejects or ignores the M-Pesa prompt.
 * There's no database, so we just tell the owner on WhatsApp. Always answer 200 —
 * otherwise Safaricom keeps retrying.
 *
 * Note: this URL is public. Treat the WhatsApp ping as a heads-up and confirm the money in
 * your M-Pesa portal / statement before handing over a pair.
 */
export async function POST(req: Request) {
  try {
    const json = (await req.json()) as { Body?: { stkCallback?: StkCallback } };
    const cb = json.Body?.stkCallback;
    if (!cb) return NextResponse.json({ ResultCode: 0, ResultDesc: "Ignored" });

    const meta = Object.fromEntries((cb.CallbackMetadata?.Item ?? []).map((i) => [i.Name, i.Value]));
    const ref = cb.CheckoutRequestID ?? "unknown";

    const text =
      cb.ResultCode === 0
        ? [
            `✅ M-Pesa payment received — ${brand.name}`,
            `Receipt: ${meta.MpesaReceiptNumber ?? "?"}`,
            `Amount: ${formatPrice(Number(meta.Amount ?? 0))}`,
            `From: ${meta.PhoneNumber ?? "?"}`,
            `Ref: ${ref}`,
            "Match the Ref with the NEW ORDER message.",
          ].join("\n")
        : [
            `⚠️ M-Pesa payment NOT completed — ${brand.name}`,
            `Reason: ${cb.ResultDesc ?? "unknown"} (code ${cb.ResultCode})`,
            `Ref: ${ref}`,
            "Don't release the order until you've been paid.",
          ].join("\n");

    console.log("[mpesa-callback]", text);
    await sendWhatsAppToOwner(text);
  } catch (err) {
    console.error("[mpesa-callback] bad payload", err);
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
