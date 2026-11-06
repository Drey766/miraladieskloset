import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { blogCover, blogs, getBlogBySlug } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";
import { WhatsAppCTA } from "@/components/home/HomeSections";
import DisplayText from "@/components/ui/DisplayText";
import { WhatsAppIcon } from "@/components/ui/Icons";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogBySlug(params.slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.published_at },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getBlogBySlug(params.slug);
  if (!post) notFound();

  const cover = blogCover(post);
  const more = blogs.filter((b) => b.id !== post.id).slice(0, 2);
  const shareText = `${post.title} — ${brand.shortName}`;

  return (
    <>
      <article className="container-site pt-6 sm:pt-10">
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="btn-ghost -ml-3">
            ← {brand.copy.sections.sneakerTalk}
          </Link>
        </div>

        <header className="mx-auto mt-2 max-w-2xl">
          <span className="badge-new">{post.tag}</span>
          <h1 className="page-title mt-3"><DisplayText>{post.title}</DisplayText></h1>
          <p className="mt-4 text-sm text-brand-muted">
            By {brand.shortName}, {formatDate(post.published_at)}, {post.read_time} min read
          </p>
        </header>

        {cover && (
          <div className="photo-tile mx-auto mt-8 aspect-[16/10] max-w-4xl">
            <Image
              src={cover}
              alt=""
              fill
              priority
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-contain p-4 sm:p-8"
            />
          </div>
        )}

        {/* Content comes from our own blogs.json, so injecting the HTML is safe. */}
        <div
          className="prose-article mx-auto mt-10 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 border-t border-brand-dark2 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-brand-dark">Know someone who needs to read this?</p>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            <WhatsAppIcon className="h-5 w-5" />
            Share
          </a>
        </div>
      </article>

      <section className="container-site section-padding">
        <div className="mb-7 flex items-baseline justify-between gap-4">
          <h2 className="section-title">More from {brand.copy.sections.sneakerTalk}</h2>
          <Link href="/shop" className="link-quiet shrink-0">
            {brand.copy.shopNow}
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
          {more.map((p, index) => (
            <BlogCard key={`${p.id}-${index}`} post={p} />
          ))}
        </div>
      </section>

      <WhatsAppCTA />
    </>
  );
}
