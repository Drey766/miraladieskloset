"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useEscape, useLockBodyScroll } from "@/lib/hooks";
import { cn, whatsappLink } from "@/lib/utils";
import {
  BagIcon,
  CloseIcon,
  HeartIcon,
  InstagramIcon,
  MenuIcon,
  PhoneIcon,
  SearchIcon,
  WhatsAppIcon,
} from "@/components/ui/Icons";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: brand.copy.sections.sneakerTalk },
  { href: "/contact", label: brand.copy.sections.hitUsUp },
];

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      {/* The logo hides below 360px so the name and the four 44px buttons always fit. */}
      <Image
        src={brand.logo}
        alt=""
        width={36}
        height={36}
        className="hidden h-9 w-9 shrink-0 rounded-full object-cover min-[360px]:block"
      />
      <span className="whitespace-nowrap font-display text-[1.375rem] leading-none text-brand-black sm:text-2xl">
        <span className="sm:hidden">{brand.shortName}</span>
        <span className="hidden sm:inline">{brand.name}</span>
      </span>
    </span>
  );
}

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute right-0.5 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[0.6875rem] font-medium leading-none text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { count: cartCount, openCart, hydrated: cartReady } = useCart();
  const { count: wishCount, hydrated: wishReady } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useLockBodyScroll(menuOpen);
  useEscape(menuOpen, closeMenu);

  // Close the mobile menu whenever we navigate.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) closeBtn.current?.focus();
  }, [menuOpen]);

  const iconBtn =
    "relative flex h-11 w-11 shrink-0 items-center justify-center text-brand-black transition-colors hover:text-brand-primary";

  const searchLink = (
    <Link href="/shop#search" aria-label="Search sneakers" className={iconBtn}>
      <SearchIcon className="h-[22px] w-[22px]" />
    </Link>
  );

  return (
    <>
      <p className="bg-brand-black px-4 py-2 text-center text-sm text-white/90">{brand.copy.announcement}</p>

      <header className="sticky top-0 z-50 border-b border-brand-dark2 bg-brand-white/95 pt-[env(safe-area-inset-top)] backdrop-blur">
        {/* Equal outer columns keep the wordmark dead centre, whatever sits either side of it. */}
        <div className="container-site grid h-16 grid-cols-[1fr_auto_1fr] items-center lg:h-20">
          <div className="-ml-2.5 flex items-center lg:ml-0">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn(iconBtn, "lg:hidden")}
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <div className="lg:hidden">{searchLink}</div>
            <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
              {NAV_LINKS.map((link, index) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={`${link.href}-${index}`}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-[44px] items-center text-brand-black underline-offset-[6px] transition-colors hover:text-brand-primary",
                      active && "underline decoration-brand-black"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <Link href="/" aria-label={`${brand.name}, home`} className="flex min-h-[44px] items-center justify-center">
            <Wordmark />
          </Link>

          <div className="-mr-2.5 flex items-center justify-end">
            <div className="hidden lg:block">{searchLink}</div>
            <Link
              href="/wishlist"
              aria-label={`${brand.copy.sections.saved}${wishReady && wishCount ? `, ${wishCount} saved` : ""}`}
              className={iconBtn}
            >
              <HeartIcon className="h-[22px] w-[22px]" />
              {wishReady && <CountBadge n={wishCount} />}
            </Link>
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart${cartReady && cartCount ? `, ${cartCount} items` : ""}`}
              className={iconBtn}
            >
              <BagIcon className="h-[22px] w-[22px]" />
              {cartReady && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-brand-white pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] lg:hidden"
        >
          <div className="container-site flex h-16 shrink-0 items-center justify-between border-b border-brand-dark2">
            <Wordmark />
            <button
              ref={closeBtn}
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className={cn(iconBtn, "-mr-2.5")}
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label="Mobile" className="container-site mt-4 flex flex-col">
            {[
              { href: "/", label: "Home" },
              ...NAV_LINKS,
              { href: "/wishlist", label: brand.copy.sections.saved },
              { href: "/cart", label: "Cart" },
            ].map((link, index) => (
              <Link
                key={`${link.href}-${index}`}
                href={link.href}
                className="flex min-h-[60px] items-center border-b border-brand-dark2 font-display text-[1.75rem] text-brand-black active:text-brand-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="container-site mt-8 flex flex-col gap-3">
            <a href={`tel:+${brand.phoneIntl}`} className="btn-primary w-full">
              <PhoneIcon className="h-5 w-5" />
              Call {brand.phone}
            </a>
            <a
              href={whatsappLink(brand.copy.whatsappGeneral)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {brand.copy.whatsappCtaButton}
            </a>
            <a
              href={brand.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline w-full"
            >
              <InstagramIcon className="h-5 w-5" />
              {brand.instagramHandle}
            </a>
          </div>
          <p className="container-site mt-8 pb-6 text-sm text-brand-muted">{brand.copy.fulfilmentBadge}</p>
        </div>
      )}
    </>
  );
}
