import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { CATEGORIES } from "@/lib/categories";
import { getProductBySlug, getRelatedProducts, primaryImage, products } from "@/lib/products";
import ProductCard from "@/components/shop/ProductCard";
import ProductDetail from "@/components/shop/ProductDetail";
import { ChevronRightIcon, FeatureIcon } from "@/components/ui/Icons";

interface PageProps {
  params: { slug: string };
}

// Every product page is pre-built at deploy time from products.json.
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: [primaryImage(product)] },
  };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 8);
  const category = CATEGORIES[product.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.review_count,
      },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.price,
      availability: product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    // pb-24 leaves room for the sticky Add to Cart bar on phones
    <div className="pb-24 sm:pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-site pt-4 sm:pt-6">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-brand-muted">
          <Link href="/shop" className="inline-flex min-h-[44px] items-center hover:text-brand-primary">
            {brand.copy.sections.theLineup}
          </Link>
          <ChevronRightIcon className="h-3 w-3" />
          <Link
            href={`/shop?category=${product.category}`}
            className="inline-flex min-h-[44px] items-center hover:text-brand-primary"
          >
            {category.label}
          </Link>
        </nav>

        <ProductDetail product={product} />
      </div>

      {product.features.length > 0 && (
        <section className="container-site mt-12 sm:mt-16" aria-labelledby="benefits-heading">
          <h2 id="benefits-heading" className="section-title mb-7">
            {brand.copy.sections.designBenefits}
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {product.features.map((f, index) => (
              <li key={`${f.title}-${index}`} className="border-t border-brand-black pt-5">
                <span className="block text-brand-black">
                  <FeatureIcon title={f.title} className="h-6 w-6" />
                </span>
                <div className="mt-3">
                  <h3 className="text-lg capitalize">{f.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-brand-dark">{f.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12 sm:mt-16" aria-labelledby="related-heading">
          <div className="container-site">
            <h2 id="related-heading" className="section-title mb-7">
              {brand.copy.sections.youMightLove}
            </h2>
          </div>
          <div className="container-site">
            <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:gap-6 sm:px-0">
              {related.map((p, index) => (
                <ProductCard
                  key={`${p.id}-${index}`}
                  product={p}
                  className="w-[46%] shrink-0 snap-start xs:w-[42%] sm:w-[30%] lg:w-[23%]"
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
