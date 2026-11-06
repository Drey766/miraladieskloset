"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { blogs } from "@/lib/content";
import { cn } from "@/lib/utils";
import BlogCard from "@/components/blog/BlogCard";

const ALL = "All";
const tags = [ALL, ...Array.from(new Set(blogs.map((b) => b.tag)))];

export default function BlogPage() {
  const [tag, setTag] = useState(ALL);
  const visible = tag === ALL ? blogs : blogs.filter((b) => b.tag === tag);

  return (
    <div className="container-site section-padding">
      <h1 className="page-title">{brand.copy.sections.sneakerTalk}</h1>
      <p className="mt-3 max-w-xl text-brand-dark">
        Buying smart, sizing right, keeping them fresh. Straight talk, no fluff.
      </p>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter posts by topic">
        {tags.map((t, index) => (
          <button
            key={`${t}-${index}`}
            type="button"
            onClick={() => setTag(t)}
            aria-pressed={tag === t}
            className={cn(
              "min-h-[44px] shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
              tag === t
                ? "border-brand-black bg-brand-black text-brand-white"
                : "border-brand-mid bg-brand-white text-brand-dark hover:border-brand-black"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((post, index) => (
          <BlogCard key={`${post.id}-${index}`} post={post} />
        ))}
      </div>
    </div>
  );
}
