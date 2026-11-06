import type { Metadata, Viewport } from "next";
import type { CSSProperties } from "react";
// next/font needs literal font names at build time. Keep these two calls in sync
// with `brand.fonts` in src/config/brand.ts — they're the only brand-ish strings
// outside that file, and only because the tooling requires it.
import { Marcellus, Jost } from "next/font/google";
import "./globals.css";
import { brand } from "@/config/brand";
import { hexToRgbTriplet, kebab } from "@/lib/utils";
import { getSiteUrl } from "@/lib/site";
import Providers from "@/components/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";

const display = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const body = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();
const title = `${brand.name} — ${brand.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${brand.name}` },
  description: brand.taglineLong,
  keywords: [...brand.seoKeywords],
  applicationName: brand.name,
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: brand.name,
    title,
    description: brand.taglineLong,
    images: [{ url: brand.logo }],
  },
  twitter: { card: "summary", title, description: brand.taglineLong },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: brand.colors.white,
};

// Every brand colour becomes a CSS variable (--brand-primary, --brand-dark2, …)
// so raw CSS in globals.css never needs a hex code of its own.
const colorVars = Object.fromEntries([
  ...Object.entries(brand.colors).map(([key, hex]) => [`--brand-${kebab(key)}`, hex]),
  ["--brand-primary-rgb", hexToRgbTriplet(brand.colors.primary)],
]) as CSSProperties;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ShoeStore",
  name: brand.name,
  description: brand.taglineLong,
  url: siteUrl,
  telephone: `+${brand.phoneIntl}`,
  email: brand.email,
  image: `${siteUrl}${brand.logo}`,
  areaServed: "KE",
  address: { "@type": "PostalAddress", addressLocality: brand.pickupLocation, addressCountry: "KE" },
  sameAs: [brand.instagramUrl],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} style={colorVars}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-brand-black focus:px-4 focus:py-2 focus:text-base focus:font-semibold focus:text-brand-white"
        >
          Skip to content
        </a>
        <Providers>
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
