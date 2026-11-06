import blogsData from "@/data/blogs.json";
import testimonialsData from "@/data/testimonials.json";
import faqsData from "@/data/faqs.json";
import type { BlogPost, Faq, Testimonial } from "@/types";
import { getProductById, primaryImage } from "@/lib/products";

export const blogs = blogsData as unknown as BlogPost[];
export const testimonials = testimonialsData as unknown as Testimonial[];
export const faqs = faqsData as unknown as Faq[];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogs.find((b) => b.slug === slug);
}

/** Cover photo for a post = first photo of the product it points at (or undefined). */
export function blogCover(post: BlogPost): string | undefined {
  const p = post.cover_product_id ? getProductById(post.cover_product_id) : undefined;
  return p ? primaryImage(p) : undefined;
}
