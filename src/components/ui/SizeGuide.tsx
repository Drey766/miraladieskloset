"use client";

import { useCallback, useState } from "react";
import { brand } from "@/config/brand";
import { useEscape, useLockBodyScroll } from "@/lib/hooks";
import { whatsappLink } from "@/lib/utils";
import { CloseIcon, RulerIcon, WhatsAppIcon } from "@/components/ui/Icons";

/**
 * Approximate foot length (cm) for each EU size, using the Paris-point rule
 * (shoe length ≈ size × 2/3 cm, foot ≈ shoe − 1.5 cm). Models vary, so it's a guide, not gospel.
 */
const footLengthCm = (eu: number) => (((eu * 2) / 3 - 1.5)).toFixed(1);

export function SizeChartTable() {
  const rows: number[] = [];
  for (let s = brand.sizeRange.min; s <= brand.sizeRange.max; s++) rows.push(s);
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[280px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-brand-mid text-sm text-brand-muted">
            <th className="py-2 pr-4 font-medium">EU size</th>
            <th className="py-2 pr-4 font-medium">Foot length</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((size, index) => (
            <tr key={`${size}-${index}`} className="border-b border-brand-mid/60">
              <td className="py-2 pr-4 font-medium text-brand-black">{size}</td>
              <td className="py-2 pr-4 text-brand-dark">{footLengthCm(size)} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SizeGuideNote() {
  return (
    <p className="text-sm text-brand-muted">
      Measure your foot heel-to-longest-toe in the evening. Between two sizes? Go up for running
      shoes, stay true for lifestyle pairs. Fit changes by model — when in doubt, ask us.
    </p>
  );
}

/** "Check My Size" button + modal. */
export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useLockBodyScroll(open);
  useEscape(open, close);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost -mr-3 text-brand-black hover:text-brand-primary"
      >
        <RulerIcon className="h-4 w-4" />
        {brand.copy.checkMySize}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-xl border border-brand-dark2 bg-brand-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-lg sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 id="size-guide-title" className="text-3xl">
                {brand.copy.sections.knowYourSize}
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close size guide"
                className="flex h-11 w-11 shrink-0 items-center justify-center text-brand-muted hover:text-brand-black"
              >
                <CloseIcon />
              </button>
            </div>
            <SizeChartTable />
            <div className="mt-4">
              <SizeGuideNote />
            </div>
            <a
              href={whatsappLink(brand.copy.whatsappGeneral)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp mt-5 w-full"
            >
              <WhatsAppIcon className="h-5 w-5" />
              {brand.copy.whatsappCtaButton}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
