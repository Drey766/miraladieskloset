import Image from "next/image";
import Link from "next/link";
import { blogCover } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import DisplayText from "@/components/ui/DisplayText";
import type { BlogPost } from "@/types";

export default function BlogCard({ post }: { post: BlogPost }) {
  const cover = blogCover(post);
  return (
    <article className="group flex flex-col">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <div className="photo-tile aspect-[4/3]">
          {cover && (
            <Image
              src={cover}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 33vw, 100vw"
            />
          )}
        </div>
        <p className="mt-4 text-sm text-brand-primary">{post.tag}</p>
        <h3 className="mt-1 font-display text-[1.375rem] font-normal leading-snug text-brand-black transition-colors group-hover:text-brand-primary">
          <DisplayText>{post.title}</DisplayText>
        </h3>
        <p className="mt-2 line-clamp-2 text-brand-dark">{post.excerpt}</p>
        <p className="mt-3 text-sm text-brand-muted">
          {formatDate(post.published_at)}, {post.read_time} min read
        </p>
      </Link>
    </article>
  );
}
