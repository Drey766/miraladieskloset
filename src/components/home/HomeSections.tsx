import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { blogs, testimonials } from "@/lib/content";
import { getActiveCategories } from "@/lib/products";
import { whatsappLink } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";
import ProductCard from "@/components/shop/ProductCard";
import Hallmark from "@/components/ui/Hallmark";
import { StarIcon, WhatsAppIcon } from "@/components/ui/Icons";
import type { Product } from "@/types";

function SectionHeader({ label, href, linkText }: { label: string; href?: string; linkText?: string }) {
  return (
    <div className="mb-7 flex items-baseline justify-between gap-4 sm:mb-10">
      <h2 className="section-title">{label}</h2>
      {href && (
        <Link href={href} className="link-quiet shrink-0">
          {linkText}
        </Link>
      )}
    </div>
  );
}

/* ---------- Fresh drops ---------- */
export function FeaturedSection({ products }: { products: Product[] }) {
  return (
    <section className="container-site section-padding">
      <SectionHeader label={brand.copy.sections.freshKicks} href="/shop" linkText={brand.copy.seeAll} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
        {products.map((p, index) => (
          <ProductCard key={`${p.id}-${index}`} product={p} />
        ))}
      </div>
    </section>
  );
}

/* ---------- Shop by style ---------- */
export function CategoryCards() {
  const categories = getActiveCategories();
  return (
    <section className="section-padding bg-brand-light">
      <div className="container-site">
        <SectionHeader label={brand.copy.sections.shopByType} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8">
          {categories.map((c, index) => (
            <Link key={`${c.slug}-${index}`} href={`/shop?category=${c.slug}`} className="group block">
              <div className="photo-tile aspect-square sm:aspect-[4/3]">
                {c.image && (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 33vw, 50vw"
                  />
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="font-display text-xl leading-tight text-brand-black transition-colors group-hover:text-brand-primary sm:text-2xl">
                  {c.short}
                </span>
                <span className="text-sm text-brand-muted">
                  {c.count} {c.count === 1 ? "pair" : "pairs"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Visit + why us ---------- */
export function VisitUs() {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`;
  return (
    <section className="bg-brand-black text-white">
      <div className="container-site section-padding grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <Hallmark className="h-28 w-28 -rotate-12 text-brand-silver sm:h-36 sm:w-36" />
          <h2 className="mt-7 text-[2.25rem] text-white sm:text-5xl">{brand.copy.visitHeading}</h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-white/75">{brand.address}</p>
          <div className="mt-7 flex flex-col gap-3 min-[400px]:flex-row">
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary !bg-white !text-brand-black hover:!bg-brand-silver"
            >
              {brand.copy.visitDirections}
            </a>
            <a
              href={`tel:+${brand.phoneIntl}`}
              className="btn-outline !border-white/50 !text-white hover:!border-white hover:!bg-white hover:!text-brand-black"
            >
              Call {brand.phone}
            </a>
          </div>
        </div>

        <ul className="grid gap-x-10 sm:grid-cols-2">
          {brand.values.map((v, index) => (
            <li key={`${v.title}-${index}`} className="border-t border-white/20 py-6">
              <h3 className="font-display text-xl font-normal text-white">{v.title}</h3>
              <p className="mt-2 leading-relaxed text-white/70">{v.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- What customers say ---------- */
export function Testimonials() {
  return (
    <section className="container-site section-padding">
      <SectionHeader label={brand.copy.sections.realTalk} />
      {/* Always three, so the row stays even. */}
      <div className="grid gap-10 md:grid-cols-3 md:gap-8">
        {testimonials.slice(0, 3).map((t, index) => (
          <figure key={`${t.id}-${index}`} className="flex flex-col border-t border-brand-black pt-5">
            <div className="flex gap-0.5 text-brand-black" role="img" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => (
                <StarIcon
                  key={`star-${t.id}-${i}`}
                  className={i < t.rating ? "h-3.5 w-3.5" : "h-3.5 w-3.5 opacity-20"}
                />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 font-display text-xl leading-snug text-brand-black sm:text-[1.375rem]">
              {t.text}
            </blockquote>
            <figcaption className="mt-5 text-brand-muted">
              <span className="font-medium text-brand-black">{t.name}</span>, {t.location}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ---------- Style files ---------- */
export function BlogPreview() {
  return (
    <section className="section-padding bg-brand-light">
      <div className="container-site">
        <SectionHeader label={brand.copy.sections.sneakerTalk} href="/blog" linkText={brand.copy.seeAll} />
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-3">
          {blogs.slice(0, 3).map((post, index) => (
            <BlogCard key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WhatsApp banner ---------- */
export function WhatsAppCTA() {
  return (
    <section className="container-site section-padding text-center">
      <p className="mx-auto max-w-2xl font-display text-[1.875rem] leading-[1.2] text-brand-black sm:text-[2.5rem]">
        {brand.copy.whatsappCta}
      </p>
      <a
        href={whatsappLink(brand.copy.whatsappGeneral)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp mt-7"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {brand.copy.whatsappCtaButton}
      </a>
    </section>
  );
}
