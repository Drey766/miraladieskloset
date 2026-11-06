import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";

// The blog index is a client page (tag filter), so its metadata lives in this tiny layout.
export const metadata: Metadata = {
  title: brand.copy.sections.sneakerTalk,
  description: `Sneaker guides, care tips and buying advice from ${brand.name}.`,
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
