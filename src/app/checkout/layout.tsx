import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: brand.copy.checkout.title, robots: { index: false } };

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children;
}
