"use client";

import { useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/Icons";

/**
 * No backend: the message opens in WhatsApp, ready to send. That's where the shop
 * actually replies, and it means nothing can get lost in a form nobody checks.
 */
export default function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.name.trim().length < 2 || form.message.trim().length < 3) {
      setError("Add your name and a quick message.");
      return;
    }
    setError(null);
    const text = [
      `Hi ${brand.shortName}! I'm ${form.name.trim()}.`,
      form.message.trim(),
      form.phone.trim() ? `Call me on: ${form.phone.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4" aria-label="Send us a message">
      <div>
        <label htmlFor="contact-name" className="label">Your name</label>
        <input
          id="contact-name" type="text" autoComplete="name" className="input" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="label">Phone (optional)</label>
        <input
          id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" className="input" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="label">Message</label>
        <textarea
          id="contact-message" rows={4} className="input" value={form.message}
          placeholder="Which pair? Which size? Ask away."
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          aria-invalid={!!error} aria-describedby={error ? "contact-error" : undefined}
        />
      </div>
      {error && <p id="contact-error" role="alert" className="text-sm font-medium text-brand-primary">{error}</p>}
      <button type="submit" className="btn-whatsapp w-full sm:w-auto">
        <WhatsAppIcon className="h-5 w-5" />
        {brand.copy.whatsappCtaButton}
      </button>
      <p className="text-xs text-brand-muted">This opens WhatsApp with your message ready to send.</p>
    </form>
  );
}
