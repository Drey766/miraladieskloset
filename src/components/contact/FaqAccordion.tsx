"use client";

import { useId, useState } from "react";
import { faqs } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@/components/ui/Icons";

export default function FaqAccordion() {
  const [open, setOpen] = useState<string | null>(null);
  const base = useId();

  return (
    <div className="divide-y divide-brand-dark2 border-y border-brand-dark2">
      {faqs.map((f, index) => {
        const isOpen = open === f.id;
        const panelId = `${base}-panel-${index}`;
        return (
          <div key={`${f.id}-${index}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : f.id)}
                className="flex min-h-[56px] w-full items-center justify-between gap-4 py-3 text-left"
              >
                <span className="font-display text-xl leading-snug text-brand-black sm:text-[1.375rem]">
                  {f.q}
                </span>
                <ChevronDownIcon
                  className={cn("h-5 w-5 shrink-0 text-brand-muted transition-transform", isOpen && "rotate-180 text-brand-black")}
                />
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!isOpen} className="pb-4 pr-9 text-brand-dark">
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
