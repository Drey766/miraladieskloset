"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand } from "@/config/brand";
import { cn, whatsappLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/ui/Icons";

/**
 * Fixed bottom-right WhatsApp button. Hidden on product, cart and checkout pages, where
 * it would sit on top of the buy buttons and the order summary, and on the home page
 * until the visitor scrolls, so the hero stays clean (it has its own "Message us" button).
 */
export default function WhatsAppFloat() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden =
    pathname.startsWith("/shop/") ||
    pathname === "/cart" ||
    pathname === "/checkout" ||
    (pathname === "/" && !scrolled);

  return (
    <a
      href={whatsappLink(brand.copy.whatsappGeneral)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${brand.shortName} on WhatsApp`}
      className={cn(
        "fixed bottom-5 right-4 z-40 h-[52px] w-[52px] items-center justify-center rounded-full bg-brand-whatsapp text-white shadow-md shadow-black/15 transition-transform active:scale-95 sm:bottom-6 sm:right-6",
        hidden ? "hidden" : "flex"
      )}
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
