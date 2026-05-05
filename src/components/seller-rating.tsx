import type { SellerReviewSummary } from "@/types/seller";

type Props = {
  summary: SellerReviewSummary;
  compact?: boolean;
};

export function SellerRating({ summary, compact }: Props) {
  const rounded = Math.round(summary.average);

  return (
    <div className="flex items-center gap-2">
      <div className="flex text-amber-400" aria-label={`${summary.average || 0} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            viewBox="0 0 20 20"
            aria-hidden="true"
            className={compact ? "h-4 w-4" : "h-5 w-5"}
            fill={star <= rounded ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m10 1.8 2.5 5.1 5.6.8-4 4 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-4 5.6-.8z" />
          </svg>
        ))}
      </div>
      <span className={compact ? "text-xs text-zinc-500" : "text-sm font-medium text-zinc-600 dark:text-zinc-400"}>
        {summary.count > 0 ? `${summary.average.toFixed(1)} (${summary.count})` : "No ratings yet"}
      </span>
    </div>
  );
}
