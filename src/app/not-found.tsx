import Link from "next/link";
import { brand } from "@/config/brand";

export default function NotFound() {
  return (
    <div className="container-site section-padding flex min-h-[55vh] flex-col items-start justify-center">
      <p className="font-display text-6xl leading-none text-brand-silver sm:text-8xl">404</p>
      <h1 className="page-title mt-4 max-w-2xl">{brand.copy.notFound}</h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn-primary">
          {brand.copy.shopCollection}
        </Link>
        <Link href="/" className="btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
