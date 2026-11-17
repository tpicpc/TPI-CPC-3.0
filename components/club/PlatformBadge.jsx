import { PLATFORMS } from "@/lib/club-format";

export default function PlatformBadge({ platform, size = "sm" }) {
  const p = PLATFORMS[platform] || PLATFORMS.other;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${p.color} ${size === "xs" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}
