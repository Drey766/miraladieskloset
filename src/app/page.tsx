import { brand } from "@/config/brand";
import HeroSection from "@/components/home/HeroSection";
import {
  BlogPreview,
  CategoryCards,
  FeaturedSection,
  Testimonials,
  VisitUs,
  WhatsAppCTA,
} from "@/components/home/HomeSections";
import { getFeaturedProducts, getProductById } from "@/lib/products";

// Server component: products, blogs and brand config are all static imports.
export default function HomePage() {
  const featured = getFeaturedProducts(8);

  return (
    <>
      <HeroSection product={getProductById(brand.heroProductId) ?? featured[0]} />
      <FeaturedSection products={featured} />
      <CategoryCards />
      <VisitUs />
      <Testimonials />
      <BlogPreview />
      <WhatsAppCTA />
    </>
  );
}
