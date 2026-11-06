"use client";

import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: string[];
  value: string | null;
  onChange: (size: string) => void;
  /** Show the error state (e.g. shopper tapped Add to Cart without choosing). */
  invalid?: boolean;
  /** Sizes that can't be picked. */
  disabledSizes?: string[];
  labelId?: string;
}

/** Big tappable size chips (44×44px minimum) — not a cramped dropdown. */
export default function SizeSelector({
  sizes,
  value,
  onChange,
  invalid,
  disabledSizes = [],
  labelId,
}: SizeSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      aria-invalid={invalid || undefined}
      className={cn(
        "grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-2 sm:grid-cols-6",
        invalid && "nudge outline outline-2 outline-offset-4 outline-brand-primary"
      )}
    >
      {sizes.map((size, index) => (
        <button
          key={`${size}-${index}`}
          type="button"
          role="radio"
          aria-checked={value === size}
          aria-label={`Size ${size}`}
          disabled={disabledSizes.includes(size)}
          onClick={() => onChange(size)}
          className="size-chip"
        >
          {size}
        </button>
      ))}
    </div>
  );
}
