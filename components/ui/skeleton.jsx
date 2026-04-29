import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200/70 dark:bg-white/[0.06]",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent",
        "dark:before:via-white/10",
        "before:animate-[shimmer_1.6s_infinite]",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
