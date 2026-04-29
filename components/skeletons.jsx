import { Skeleton } from "@/components/ui/skeleton";

const cardCls = "rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden";

export function CardSkeleton() {
  return (
    <div className={cardCls}>
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="w-7 h-7 rounded-full" />
          <Skeleton className="h-3 flex-1 max-w-[120px]" />
        </div>
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 6, cols = "md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid grid-cols-1 ${cols} gap-5`}>
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function TeamMemberSkeleton({ size = "md" }) {
  const sizeMap = {
    sm: "w-28 h-28 sm:w-32 sm:h-32",
    md: "w-36 h-36 sm:w-40 sm:h-40",
    lg: "w-44 h-44 sm:w-52 sm:h-52",
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className={`${sizeMap[size] || sizeMap.md} rounded-full`} />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function TeamGridSkeleton({ count = 8, size = "md" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
      {Array.from({ length: count }).map((_, i) => <TeamMemberSkeleton key={i} size={size} />)}
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className={`${cardCls} p-5 flex items-center gap-4`}>
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md shrink-0" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <ListRowSkeleton key={i} />)}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className={cardCls}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 w-16" />)}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0 flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-9 h-9 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className={`${cardCls} p-5`}>
      <Skeleton className="w-10 h-10 rounded-lg mb-3" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-12" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video rounded-xl w-full max-h-[420px]" />
      <Skeleton className="h-9 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <div className="space-y-2 pt-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="aspect-video rounded-xl" />
      <div className={`${cardCls} p-4 space-y-3`}>
        <Skeleton className="h-2 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="w-9 h-9 rounded-full" />
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ForumRowSkeleton() {
  return (
    <div className={`${cardCls} p-5 flex gap-5`}>
      <div className="hidden sm:flex flex-col gap-3 w-16">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="flex-1 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ProfileHeroSkeleton() {
  return (
    <div className={`${cardCls} p-6 md:p-8 flex flex-col md:flex-row gap-6`}>
      <Skeleton className="w-28 h-28 md:w-36 md:h-36 rounded-full shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-2 pt-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-24 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}
