// =====================================================
// BRAND CONFIGURATION — SINGLE SOURCE OF TRUTH
// =====================================================
// To rebrand this entire site for a different shop, edit
// ONLY this file. Every page, component, and piece of copy
// imports its brand-specific values from here — nothing
// is hardcoded anywhere else in the codebase.
//
// This file is intentionally the ONLY place that knows the
// shop's name, tagline, colours, contact details, and voice.
//
// Two things sit outside this file because the tooling forces it:
//   1. Font loading — `next/font/google` needs literal font names at build
//      time, so src/app/layout.tsx calls Marcellus() / Jost() directly.
//      If you change `fonts` below, change those two calls to match.
//   2. Logo / favicon files — swap public/logo.jpg, src/app/icon.jpg and
//      src/app/apple-icon.jpg with the new shop's logo (same file names).
//
// Everything else — Tailwind colours, CSS variables, metadata, WhatsApp
// links, order ID prefix, micro-copy — flows from this object.

export const brand = {
  // ── IDENTITY ──
  name: "Mira Ladies Kloset",
  shortName: "Mira", // Used in tight spaces (mobile nav, favicon title)
  tagline: "Unique. Trendy. Quality.",
  taglineLong:
    "Unique, trendy and quality ladies sneakers — shop in-store at Ebrahims Mall, Moi Avenue, or get your pair delivered countrywide.",
  instagramHandle: "@mira_ladies_sneakers",
  instagramUrl: "https://www.instagram.com/mira_ladies_sneakers/",
  logo: "/logo.jpg", // small chrome/silver emblem on a soft grey vignette — see public/
  // Product shown in the home page hero (its `id` in src/data/products.json).
  heroProductId: "15",
  // Prefix for localStorage keys (cart, wishlist) so two shops on one domain never clash.
  storagePrefix: "mira-ladies-sneakers",
  // Extra words for <meta name="keywords"> / SEO.
  seoKeywords: [
    "ladies sneakers Kenya",
    "women's sneakers Nairobi",
    "trendy sneakers for women",
    "Ebrahims Mall Moi Avenue sneakers",
    "buy sneakers online Kenya",
    "M-Pesa sneakers",
  ],

  // ── CONTACT ──
  // NOTE: the Instagram bio lists 0713 268 179 as the shop line; a separate post
  // used 0700 107 179 for DM orders. This build uses the bio number everywhere —
  // swap it here if the other one is actually the primary line.
  phone: "0713 268 179",
  phoneIntl: "254713268179", // For wa.me links and API env defaults
  whatsappUrl: "https://wa.me/254713268179",
  email: "hello@miraladiessneakers.co.ke", // Placeholder — update as needed

  // ── LOCATION ──
  pickupLocation: "Ebrahims Mall, Moi Avenue",
  deliveryArea: "Delivery across Kenya (fee applies)",
  address: "1st Floor, Shop E8, Ebrahims Mall, Moi Avenue, Nairobi",
  pickupInstructions:
    "Once your order is confirmed, come through to Shop E8 on the 1st floor of Ebrahims Mall, Moi Avenue. Have your order number and phone ready.",
  // The shop's hallmark: a jeweller-style stamp built from the real shop unit.
  hallmark: {
    unit: "E8",
    ring: "1ST FLOOR • EBRAHIMS MALL • MOI AVENUE • ",
  },

  // ── SIZING ──
  sizeRange: { min: 36, max: 46 },

  // ── MONEY ──
  currency: "KSh",
  // Delivery fees in KES — PLACEHOLDERS, confirm with the shop owner.
  shipping: {
    nairobi: 300,
    nairobiMetro: 450, // counties listed below
    upcountry: 700,
    nairobiMetroCounties: ["Kiambu", "Kajiado", "Machakos"],
    freeDeliveryOver: 0, // e.g. 15000 = free delivery above KSh 15,000. 0 = off
  },
  payments: {
    // "CustomerPayBillOnline" for a Paybill shortcode, "CustomerBuyGoodsOnline" for a Till.
    // The bio lists TILL NO: 5562041 — this is a Buy Goods till, not a Paybill.
    mpesaTransactionType: "CustomerBuyGoodsOnline",
    mpesaDescription: "Sneaker order", // shown on the customer's M-Pesa prompt (max 13 chars)
    tillNumber: "5562041", // shown to customers who'd rather pay manually; see README for STK setup
  },

  // ── VOICE / MICRO-COPY ──
  // All personality copy lives here. Components never type these literally.
  copy: {
    // Slim strip above the header
    announcement: "Free pickup at Ebrahims Mall. Delivery across Kenya.",

    // Hero
    heroHeadline: "Shine in style.",
    heroSubtext:
      "Trendy, quality ladies sneakers, ready to try on at Ebrahims Mall or delivered anywhere in Kenya.",

    // Visit section (home page)
    visitHeading: "Come and try them on.",
    visitDirections: "Get directions",

    // States
    emptyCart: "Your cart is empty. Let's find a pair you love.",
    emptyWishlist: "Nothing saved yet. Tap the heart on any pair to keep it here.",
    orderConfirmed: "Thank you. We've got your order.",
    loading: "Just a moment…",
    noResults: "No pairs match that. Call or message us, we may still have it in store.",
    notFound: "We can't find this page, but the shoes are this way.",

    // Footer / newsletter
    newsletter: "New pairs reach this list first.",
    newsletterPlaceholder: "Your WhatsApp number",
    newsletterButton: "Join the list",
    newsletterThanks: "WhatsApp is opening. Send the message and you're on the list.",
    footerTagline: "Unique. Trendy. Quality. Every single pair.",
    disclaimerText: "", // Set if the shop needs a disclaimer, else leave blank

    // WhatsApp
    whatsappCta: "Not sure of your size? Ask us and we'll check stock for you.",
    whatsappCtaButton: "Chat on WhatsApp",
    whatsappEnquiry: (productName: string, size?: string) =>
      `Hi! I'm interested in the ${productName}${size ? ` in size ${size}` : ""}. Is it in stock?`,
    whatsappGeneral: "Hi! I'd like to ask about your sneakers.",

    // Stock / fulfilment badges
    lowStock: "Almost out, so move fast.",
    outOfStock: "Sold out for now. Message us, restocks happen often.",
    fulfilmentBadge: "Pickup at Ebrahims Mall or delivery across Kenya",
    badges: {
      new: "New",
      clearance: "End of line",
      lowStock: "Almost out",
      soldOut: "Sold out",
    },

    // Buttons
    addToCart: "Add to cart",
    save: "Save",
    saved: "Saved",
    shopNow: "Shop now",
    shopCollection: "Shop the collection",
    dmUs: "Message us",
    checkMySize: "Size guide",
    seeAll: "See all",
    searchPlaceholder: "Search by style, brand or colour",

    // Contact page
    contactIntro: "Questions on size, stock or delivery? Call, text or message us. Real replies, fast.",
    deliveryExplainer:
      "Nairobi orders usually land same day to next day. Upcountry takes a little longer depending on where you are, and we keep you posted the whole way.",

    // Section labels
    sections: {
      freshKicks: "Fresh drops",
      shopByType: "Shop by style",
      theLineup: "The collection",
      realTalk: "What customers say",
      sneakerTalk: "Style files",
      knowYourSize: "Find your fit",
      hitUsUp: "Get in touch",
      youMightLove: "You might also love",
      designBenefits: "Why it works",
      saved: "Saved pairs",
    },

    // Checkout
    checkout: {
      title: "Checkout",
      stepFulfilment: "How you'll get it",
      stepDetails: "Your details",
      stepPayment: "Payment",
      pickupLabel: "Ebrahims Mall pickup",
      pickupHint: "Free. Collect your pair at Shop E8.",
      deliveryLabel: "Delivery",
      deliveryHint: "Across Kenya. Fee depends on your county.",
      mpesaLabel: "Pay now with M-Pesa",
      mpesaHint: "We'll send an M-Pesa prompt to your phone. Enter your PIN and you're done.",
      onDeliveryLabel: "Pay on pickup or delivery",
      onDeliveryHint: "Cash or M-Pesa when you get your pair. We'll call to confirm.",
      paymentNote: "Pay via M-Pesa or call us to arrange cash on pickup.",
      placeOrder: "Place order",
      sendOnWhatsApp: "Send order on WhatsApp",
      confirmOnWhatsApp:
        "Tap below to send us your order details on WhatsApp. It's the fastest way to get your pair moving.",
      mpesaPrompt: "Check your phone for the M-Pesa prompt and enter your PIN to pay.",
      payLater: "Pay when you pick up or receive your pair. We'll call to confirm.",
    },
  },

  // ── BRAND VALUES ── (home page visit section)
  values: [
    {
      title: "Unique and quality",
      text: "Trendy styles picked with an eye for quality, not just whatever's popular.",
    },
    {
      title: "Pickup or delivery",
      text: "Grab your pair at Shop E8, or have it delivered anywhere in Kenya for a fee.",
    },
    {
      title: "We reply fast",
      text: "Questions about size or stock? DM or call. We don't leave you on read.",
    },
    {
      title: "Fresh drops often",
      text: "New pairs land regularly and stock moves fast. Follow us so you never miss one.",
    },
  ],

  // ── COLOURS ── (these feed tailwind.config.ts AND the CSS variables set in
  // layout.tsx, so this is the only place hex codes live)
  //
  // A jewellery counter for sneakers: white and pearl surfaces, a silver
  // vignette taken from the chrome logo, deep aubergine in place of black, and
  // garnet as a sparing jewel accent. Token names describe ROLE, not shade —
  // `black` is the ink colour, even though it's actually aubergine.
  colors: {
    primary: "#8A1C44", // Garnet: sale tag, wishlist heart, errors, count badges
    primaryLight: "#E0ADC0", // Garnet tint, for accents on the dark sections
    primaryDark: "#6B1434",
    black: "#241427", // Aubergine ink: headings, primary text, primary buttons, footer
    dark: "#574D5B", // Secondary text on white
    dark2: "#E8E5EA", // Hairline borders, dividers
    mid: "#CFCBD3", // Input borders
    muted: "#6F6675", // Tertiary text (still passes AA on white and pearl)
    light: "#F6F5F7", // Pearl section band
    white: "#FFFFFF", // Page background
    silver: "#C4C4CB", // Outer edge of the hero's chrome vignette
    // Product photos are shot on a neutral studio grey, so this is what shows
    // behind them while they load.
    photo: "#F1F1F2",
    whatsapp: "#25D366", // WhatsApp green (kept here so no hex lives in CSS)
  },

  // ── FONTS ──
  // NOTE: next/font needs literal names — keep layout.tsx in sync with these.
  fonts: {
    display: "Marcellus", // Engraved-feeling roman that echoes the logo. Single weight: never bold it.
    body: "Jost", // Geometric, fashion-poster sans with clean numerals: all UI and every price
  },
} as const;

export type Brand = typeof brand;
