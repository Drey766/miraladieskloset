"use client";

import { useEffect, useRef } from "react";
import { getActiveCategories, getBrands, products } from "@/lib/products";
import { GENDERS, PRICE_RANGES, type Filters } from "@/lib/filters";
import { useEscape, useLockBodyScroll } from "@/lib/hooks";
import { cn, prettyBrand } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/Icons";

const categories = getActiveCategories();
const brands = getBrands();
// Only offer genders the shop actually stocks.
const genders = GENDERS.filter((g) => products.some((p) => p.gender === g.value));
const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes))).sort((a, b) => Number(a) - Number(b));

interface PanelProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-[44px] rounded-full border px-2 text-sm transition-colors",
        active
          ? "border-brand-black bg-brand-black text-brand-white"
          : "border-brand-mid bg-brand-white text-brand-dark hover:border-brand-black"
      )}
    >
      {children}
    </button>
  );
}

function Group({ title, children, stacked }: { title: string; children: React.ReactNode; stacked?: boolean }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="label">{title}</legend>
      <div className={cn("grid gap-2", stacked ? "grid-cols-1" : "grid-cols-2")}>{children}</div>
    </fieldset>
  );
}

/** All the filter controls. Used inside the mobile bottom sheet AND the desktop sidebar. */
export function FilterPanel({ filters, onChange }: PanelProps) {
  return (
    <div className="space-y-6">
      <Group title="Category">
        <Chip active={!filters.category} onClick={() => onChange({ category: "" })}>
          All
        </Chip>
        {categories.map((c, index) => (
          <Chip
            key={`${c.slug}-${index}`}
            active={filters.category === c.slug}
            onClick={() => onChange({ category: filters.category === c.slug ? "" : c.slug })}
          >
            {c.short} ({c.count})
          </Chip>
        ))}
      </Group>

      <Group title="Brand">
        {brands.map((b, index) => (
          <Chip
            key={`${b}-${index}`}
            active={filters.brand === b}
            onClick={() => onChange({ brand: filters.brand === b ? "" : b })}
          >
            {prettyBrand(b)}
          </Chip>
        ))}
      </Group>

      <Group title="Gender">
        {genders.map((g, index) => (
          <Chip
            key={`${g.value}-${index}`}
            active={filters.gender === g.value}
            onClick={() => onChange({ gender: filters.gender === g.value ? "" : g.value })}
          >
            {g.label}
          </Chip>
        ))}
      </Group>

      <fieldset className="border-0 p-0">
        <legend className="label">Size (EU)</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-2">
          {allSizes.map((s, index) => (
            <button
              key={`${s}-${index}`}
              type="button"
              role="checkbox"
              aria-checked={filters.size === s}
              onClick={() => onChange({ size: filters.size === s ? "" : s })}
              className="size-chip"
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <Group title="Price" stacked>
        {PRICE_RANGES.map((r, index) => (
          <Chip
            key={`${r.id}-${index}`}
            active={filters.price === r.id}
            onClick={() => onChange({ price: filters.price === r.id ? "" : r.id })}
          >
            {r.label}
          </Chip>
        ))}
      </Group>

      <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-md border border-brand-mid bg-brand-white px-4">
        <span className="text-brand-black">On sale only</span>
        <input
          type="checkbox"
          checked={filters.sale}
          onChange={(e) => onChange({ sale: e.target.checked })}
          className="h-5 w-5 accent-brand-primary"
        />
      </label>
    </div>
  );
}

interface SheetProps extends PanelProps {
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  resultCount: number;
}

/** Mobile bottom-sheet drawer (hidden on lg+, where the sidebar takes over). */
export default function FilterSheet({ open, onClose, onReset, resultCount, filters, onChange }: SheetProps) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useLockBodyScroll(open);
  useEscape(open, onClose);
  useEffect(() => {
    if (open) closeBtn.current?.focus();
  }, [open]);

  return (
    <div
      className={cn("fixed inset-0 z-[60] transition-[visibility] duration-300 lg:hidden", open ? "visible" : "invisible")}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl border border-brand-dark2 bg-brand-white transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between px-4">
          <h2 className="py-2 text-2xl">Filters</h2>
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-brand-muted hover:text-brand-black"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
          <FilterPanel filters={filters} onChange={onChange} />
        </div>
        <div className="flex gap-3 border-t border-brand-dark2 bg-brand-light p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={onReset} className="btn-outline !px-5">
            Reset
          </button>
          <button type="button" onClick={onClose} className="btn-primary flex-1 whitespace-nowrap !px-4">
            Show {resultCount} {resultCount === 1 ? "pair" : "pairs"}
          </button>
        </div>
      </div>
    </div>
  );
}
