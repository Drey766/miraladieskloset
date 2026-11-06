"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { brand } from "@/config/brand";
import { getActiveCategories } from "@/lib/products";
import { whatsappLink } from "@/lib/utils";
import { InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/Icons";

const categories = getActiveCategories();

const heading = "font-body text-base font-medium text-white";
const footerLink = "flex min-h-[44px] items-center gap-2.5 text-white/70 transition-colors hover:text-white lg:min-h-[36px]";

export default function Footer() {
  const [contact, setContact] = useState("");
  const [thanks, setThanks] = useState(false);

  // There's no email backend in this build, so the drop list works over WhatsApp:
  // the shopper's number is pre-filled into a message to the shop.
  const onSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = contact.trim();
    if (!value) return;
    window.open(
      whatsappLink(`Hi! Add me to the drop list. My number: ${value}`),
      "_blank",
      "noopener,noreferrer"
    );
    setThanks(true);
    setContact("");
  };

  return (
    <footer className="bg-brand-black pb-[env(safe-area-inset-bottom)]">
      {/* Drop list */}
      <div className="border-b border-white/15">
        <div className="container-site grid items-center gap-5 py-10 lg:grid-cols-2 lg:gap-20 lg:py-14">
          <label htmlFor="footer-drop" className="font-display text-[1.75rem] leading-tight text-white sm:text-[2rem]">
            {brand.copy.newsletter}
          </label>
          <form onSubmit={onSubscribe} aria-label="Drop list">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="footer-drop"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={contact}
                onChange={(e) => {
                  setContact(e.target.value);
                  setThanks(false);
                }}
                placeholder={brand.copy.newsletterPlaceholder}
                className="min-h-[48px] w-full flex-1 rounded-full border border-white/30 bg-transparent px-5 text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                required
              />
              <button
                type="submit"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 font-medium text-brand-black transition-colors hover:bg-brand-silver"
              >
                {brand.copy.newsletterButton}
              </button>
            </div>
            {thanks && (
              <p role="status" className="mt-3 text-sm text-brand-primary-light">
                {brand.copy.newsletterThanks}
              </p>
            )}
          </form>
        </div>
      </div>

      <div className="container-site grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-4 lg:py-16">
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <Image src={brand.logo} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            <p className="font-display text-xl leading-tight text-white">{brand.name}</p>
          </div>
          <p className="mt-4 max-w-xs leading-relaxed text-white/70">{brand.copy.footerTagline}</p>
        </div>

        <nav aria-label="Shop by style">
          <h2 className={heading}>{brand.copy.sections.shopByType}</h2>
          <ul className="mt-3">
            {categories.map((c, index) => (
              <li key={`${c.slug}-${index}`}>
                <Link href={`/shop?category=${c.slug}`} className={footerLink}>
                  {c.short}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className={heading}>Help</h2>
          <ul className="mt-3">
            {[
              { href: "/shop", label: brand.copy.sections.theLineup },
              { href: "/contact#size", label: brand.copy.sections.knowYourSize },
              { href: "/blog", label: brand.copy.sections.sneakerTalk },
              { href: "/contact#faq", label: "FAQs" },
              { href: "/contact", label: brand.copy.sections.hitUsUp },
            ].map((link, index) => (
              <li key={`${link.href}-${index}`}>
                <Link href={link.href} className={footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1">
          <h2 className={heading}>{brand.copy.sections.hitUsUp}</h2>
          <ul className="mt-3">
            <li>
              <a href={`tel:+${brand.phoneIntl}`} className={footerLink}>
                <PhoneIcon className="h-4 w-4" /> {brand.phone}
              </a>
            </li>
            <li>
              <a href={whatsappLink(brand.copy.whatsappGeneral)} target="_blank" rel="noopener noreferrer" className={footerLink}>
                <WhatsAppIcon className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={brand.instagramUrl} target="_blank" rel="noopener noreferrer" className={footerLink}>
                <InstagramIcon className="h-4 w-4" /> {brand.instagramHandle}
              </a>
            </li>
            <li className="flex min-h-[44px] items-center gap-2.5 text-white/70 lg:min-h-[36px]">
              <PinIcon className="h-4 w-4" /> {brand.pickupLocation}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-site flex flex-col gap-1 py-5 text-sm text-white/60 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          {brand.copy.disclaimerText && <p className="max-w-xl">{brand.copy.disclaimerText}</p>}
        </div>
      </div>
    </footer>
  );
}
