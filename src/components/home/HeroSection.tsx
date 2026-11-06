import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { primaryImage } from "@/lib/products";
import { formatPrice, whatsappLink } from "@/lib/utils";
import Hallmark from "@/components/ui/Hallmark";
import type { Product } from "@/types";

/** A centred display case: headline above, one shoe on show, the shop's hallmark beside it. */
export default function HeroSection({ product }: { product?: Product }) {
  return (
    <section className="hero-vignette overflow-hidden">
      {/* z-10: the shoe's photo overlaps this block, and must never sit over the buttons. */}
      <div className="container-site relative z-10 pt-10 text-center sm:pt-14">
        <h1 className="hero-title text-balance">{brand.copy.heroHeadline}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-brand-dark sm:text-xl">
          {brand.copy.heroSubtext}
        </p>
        <div className="mx-auto mt-6 flex max-w-md justify-center gap-3">
          <Link href="/shop" className="btn-primary flex-1 !px-4">
            {brand.copy.shopNow}
          </Link>
          <a
            href={whatsappLink(brand.copy.whatsappGeneral)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline flex-1 !px-4"
          >
            {brand.copy.dmUs}
          </a>
        </div>
      </div>

      {product && (
        <div className="container-site relative pb-8 sm:pb-10">
          {/* The photo is square with empty space above and below the shoe, so it tucks up under the buttons. */}
          <Link
            href={`/shop/${product.slug}`}
            aria-label={`${product.name}, ${formatPrice(product.price)}`}
            className="hero-settle relative mx-auto -mt-12 block aspect-square w-full max-w-sm sm:-mt-24 sm:max-w-xl lg:-mb-24 lg:-mt-40"
          >
            <Image
              src={primaryImage(product)}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 640px) 580px, 100vw"
              className="hero-shoe object-contain"
            />
          </Link>

          {/* Stamp on the left, the shoe's details on the right, the same distance from each edge. */}
          <div className="relative -mt-16 flex items-end justify-between gap-4 sm:-mt-28 lg:absolute lg:inset-x-12 lg:bottom-10 lg:mt-0">
            <Hallmark className="h-20 w-20 shrink-0 -rotate-12 text-brand-black sm:h-28 sm:w-28 lg:h-36 lg:w-36" />
            <Link
              href={`/shop/${product.slug}`}
              className="min-w-0 max-w-[15rem] text-right text-brand-black hover:text-brand-primary"
            >
              <span className="line-clamp-2 text-sm leading-snug sm:text-base">{product.name}</span>
              <span className="price mt-0.5 block text-base sm:text-lg">{formatPrice(product.price)}</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
