import { Skeleton } from "@/components/ui/skeleton";

import { CanhoesDecorativeDivider, CanhoesGlowBackdrop } from "@/components/ui/canhoes-bits";

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <FeedPostSkeleton key={index} index={index} />
      ))}
    </div>
  );
}

interface FeedPostSkeletonProps {
  index: number;
}

function FeedPostSkeleton({ index }: FeedPostSkeletonProps) {
  return (
    <div
      className="canhoes-bits-panel canhoes-bits-panel--social editorial-shell overflow-hidden rounded-[var(--radius-lg-token)] blurfade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CanhoesGlowBackdrop tone="social" />

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-2.5 w-24 rounded" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
          <Skeleton className="h-3 w-3/5 rounded" />
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-md-token)]" />
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <CanhoesDecorativeDivider tone="purple" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, actionIndex) => (
            <Skeleton
              key={actionIndex}
              className="h-9 w-20 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}


