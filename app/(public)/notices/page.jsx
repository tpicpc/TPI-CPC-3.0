"use client";

import ClubHero, { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import { ListSkeleton } from "@/components/skeletons";
import { fmtDate, timeAgo } from "@/lib/club-format";
import axios from "axios";
import { ArrowUpRight, Megaphone, Pin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATS = ["All", "General", "Event", "Contest", "Workshop", "Urgent"];
const CAT_STYLE = {
  General: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
  Event: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  Contest: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  Workshop: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  Urgent: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

export default function NoticesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    axios.get("/api/v1/announcements").then(({ data }) => data.success && setItems(data.announcements)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const list = useMemo(() => items.filter((a) => cat === "All" || a.category === cat), [items, cat]);

  return (
    <div>
      <ClubHero eyebrow="Community" icon={<Megaphone size={14} />} title="Notice board" subtitle="Official announcements from the club committee. Members also get these in the notification bell and by email.">
        <div className="flex flex-wrap gap-2">{CATS.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
      </ClubHero>
      <div className="px-4 md:px-10 container mx-auto py-8 max-w-4xl">
        {loading ? <ListSkeleton count={5} /> : list.length === 0 ? (
          <EmptyState icon={<Megaphone size={20} />} title="No notices here yet" />
        ) : (
          <ol className="relative border-l-2 border-gray-200 dark:border-white/10 ml-3 space-y-6">
            {list.map((a) => (
              <li key={a._id} className="pl-6 relative">
                <span className={`absolute -left-[9px] top-5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-950 ${a.pinned ? "bg-amber-500" : a.category === "Urgent" ? "bg-rose-500" : "bg-indigo-500"}`} />
                <article className={`${panel} p-5 ${a.pinned ? "ring-1 ring-amber-400/40" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {a.pinned && <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"><Pin size={12} /> Pinned</span>}
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${CAT_STYLE[a.category]}`}>{a.category}</span>
                    <span className="text-gray-500" title={fmtDate(a.createdAt)}>{timeAgo(a.createdAt)}</span>
                  </div>
                  <h2 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{a.title}</h2>
                  {a.body && <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-line">{a.body}</p>}
                  {a.link && (
                    <a href={a.link} target={a.link.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                      Learn more <ArrowUpRight size={14} />
                    </a>
                  )}
                </article>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
