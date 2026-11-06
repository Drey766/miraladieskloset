import { StarIcon } from "@/components/ui/Icons";

export default function StarRating({
  rating,
  count,
  className = "",
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  if (!rating) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-brand-dark ${className}`}>
      <StarIcon className="h-4 w-4 text-brand-black" />
      <span className="font-medium text-brand-black">{rating.toFixed(1)}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-brand-muted">({count.toLocaleString("en-US")})</span>
      )}
    </span>
  );
}
