import { brand } from "@/config/brand";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: brand.copy.sections.saved, robots: { index: false } };

export default function WishlistLayout({ children }: { children: ReactNode }) {
  return children;
}
