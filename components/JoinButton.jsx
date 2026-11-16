"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";

const sizes = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-10 px-5 text-sm gap-2",
  lg: "h-12 px-7 text-base gap-2",
};

/**
 * Primary "Join Us" call-to-action. A real link (so it prefetches, works with
 * middle-click / open in new tab, and is keyboard accessible) styled as the
 * site's primary gradient pill.
 */
export default function JoinButton({ size = "md", label = "Join Us", href = "/signup", className, showArrow = true, icon = false, ...rest }) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold text-white",
        "bg-gradient-to-r from-indigo-500 via-indigo-500 to-violet-500 bg-[length:200%_100%] bg-left hover:bg-right",
        "shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 ring-1 ring-inset ring-white/15",
        "transition-all duration-300 hover:-translate-y-px active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950",
        sizes[size],
        className
      )}
      {...rest}
    >
      {icon && <UserPlus size={size === "lg" ? 18 : 16} className="shrink-0" />}
      <span>{label}</span>
      {showArrow && <ArrowRight size={size === "lg" ? 18 : 15} className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />}
    </Link>
  );
}
