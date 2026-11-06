import { useId } from "react";
import { brand } from "@/config/brand";

/**
 * The shop's signature: a jeweller-style hallmark stamp built from its real
 * address, with the shop unit in the middle and the location around the ring.
 * Colour comes from `currentColor`, so it works on silver and on aubergine.
 */
export default function Hallmark({ className }: { className?: string }) {
  const pathId = `hallmark-${useId().replace(/:/g, "")}`;
  const radius = 72;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={brand.address}
      className={className}
    >
      <defs>
        <path
          id={pathId}
          d={`M 100 100 m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`}
        />
      </defs>
      <circle cx="100" cy="100" r="97" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <text
        fill="currentColor"
        fontSize="13.5"
        fontWeight="500"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <textPath href={`#${pathId}`} textLength={circumference} lengthAdjust="spacing">
          {brand.hallmark.ring}
        </textPath>
      </text>
      <text
        x="100"
        y="100"
        fill="currentColor"
        fontSize="44"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {brand.hallmark.unit}
      </text>
    </svg>
  );
}
