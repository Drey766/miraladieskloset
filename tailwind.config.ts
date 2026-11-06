import type { Config } from "tailwindcss";
// The palette and font names come straight from the brand config — this file
// has NO colours of its own. Change them in src/config/brand.ts.
// (Relative import on purpose: Tailwind's config loader doesn't know the "@/" alias.)
import { brand } from "./src/config/brand";

// primaryLight -> "primary-light", so `bg-brand-primary-light` just works.
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const brandColors = Object.fromEntries(
  Object.entries(brand.colors).map(([key, hex]) => [kebab(key), hex])
);

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { brand: brandColors },
      fontFamily: {
        // --font-display / --font-body are set by next/font in src/app/layout.tsx
        // Fallbacks are a soft serif and a clean grotesk, so the pairing stays close in character if the web font is slow.
        display: ["var(--font-display)", brand.fonts.display, "Times New Roman", "serif"],
        body: ["var(--font-body)", brand.fonts.body, "system-ui", "sans-serif"],
      },
      screens: { xs: "420px" },
    },
  },
  plugins: [],
};

export default config;
