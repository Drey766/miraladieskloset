// Server-only helper: Safaricom Daraja STK Push.
//
// Environment is chosen from the shortcode so we stay within the 9 env vars:
//   174379 (Daraja's public test shortcode) -> sandbox, anything else -> production.

import { brand } from "@/config/brand";

const isPlaceholder = (v?: string) => !v || v.startsWith("your_");

export interface MpesaConfig {
  key: string;
  secret: string;
  shortCode: string;
  passkey: string;
  callbackUrl: string;
  baseUrl: string;
}

export function getMpesaConfig(): MpesaConfig | null {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const shortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;
  if ([key, secret, shortCode, passkey, callbackUrl].some(isPlaceholder)) return null;
  return {
    key: key!,
    secret: secret!,
    shortCode: shortCode!,
    passkey: passkey!,
    callbackUrl: callbackUrl!,
    baseUrl: shortCode === "174379" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke",
  };
}

/** Daraja wants YYYYMMDDHHmmss in Nairobi time (UTC+3). */
function timestamp(): string {
  return new Date(Date.now() + 3 * 3600 * 1000).toISOString().replace(/\D/g, "").slice(0, 14);
}

async function getAccessToken(cfg: MpesaConfig): Promise<string> {
  const auth = Buffer.from(`${cfg.key}:${cfg.secret}`).toString("base64");
  const res = await fetch(`${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Daraja auth returned no token");
  return json.access_token;
}

export interface StkResult {
  ok: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
}

/** Ask Safaricom to pop the M-Pesa PIN prompt on the customer's phone. `phone` must be 2547XXXXXXXX. */
export async function sendStkPush(
  cfg: MpesaConfig,
  opts: { phone: string; amount: number; orderId: string }
): Promise<StkResult> {
  try {
    const token = await getAccessToken(cfg);
    const ts = timestamp();
    const password = Buffer.from(`${cfg.shortCode}${cfg.passkey}${ts}`).toString("base64");

    const res = await fetch(`${cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: cfg.shortCode,
        Password: password,
        Timestamp: ts,
        TransactionType: brand.payments.mpesaTransactionType,
        Amount: Math.max(1, Math.round(opts.amount)),
        PartyA: opts.phone,
        PartyB: cfg.shortCode,
        PhoneNumber: opts.phone,
        CallBackURL: cfg.callbackUrl,
        // Daraja caps AccountReference at 12 characters: "SNE-" + last 8 digits of the order id.
        AccountReference: `${opts.orderId.slice(0, 4)}${opts.orderId.slice(-8)}`.slice(0, 12),
        TransactionDesc: brand.payments.mpesaDescription.slice(0, 13),
      }),
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });

    const json = (await res.json().catch(() => ({}))) as {
      ResponseCode?: string;
      CheckoutRequestID?: string;
      MerchantRequestID?: string;
      errorMessage?: string;
      ResponseDescription?: string;
    };

    if (res.ok && json.ResponseCode === "0") {
      return { ok: true, checkoutRequestId: json.CheckoutRequestID, merchantRequestId: json.MerchantRequestID };
    }
    return { ok: false, error: json.errorMessage || json.ResponseDescription || `STK Push failed (${res.status})` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "STK Push request failed" };
  }
}
