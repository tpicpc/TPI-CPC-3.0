"use client";

import { Chip, EmptyState, panel } from "@/components/club/ClubHero";
import { CardGridSkeleton } from "@/components/skeletons";
import axios from "axios";
import {
  ArrowUpRight, Binary, BrainCircuit, Cloud, Code2, Compass, Database, Globe, Map as MapIcon, Palette, Search, ShieldCheck, Smartphone, Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DOMAIN_STYLE = {
  cs: { icon: Binary, grad: "from-indigo-500 to-violet-500" },
  ai: { icon: BrainCircuit, grad: "from-fuchsia-500 to-pink-500" },
  web: { icon: Globe, grad: "from-sky-500 to-blue-600" },
  mobile: { icon: Smartphone, grad: "from-emerald-500 to-teal-500" },
  devops: { icon: Cloud, grad: "from-cyan-500 to-sky-600" },
  db: { icon: Database, grad: "from-amber-500 to-orange-500" },
  lang: { icon: Code2, grad: "from-violet-500 to-purple-600" },
  security: { icon: ShieldCheck, grad: "from-rose-500 to-red-500" },
  product: { icon: Palette, grad: "from-orange-400 to-pink-500" },
  other: { icon: Compass, grad: "from-gray-500 to-gray-700" },
};
const KINDS = [
  { key: "all", label: "All" },
  { key: "role", label: "Role-based" },
  { key: "skill", label: "Skill-based" },
  { key: "beginner", label: "Beginner-friendly" },
];
const KIND_LABEL = { role: "Role", skill: "Skill", beginner: "Beginner" };

function RoadmapCard({ r }) {
  const st = DOMAIN_STYLE[r.domain] || DOMAIN_STYLE.other;
  const Icon = st.icon;
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${panel} group relative h-full p-4 flex flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/40 transition`}
    >
      <span className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${st.grad} opacity-10 group-hover:opacity-20 transition`} />
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${st.grad} text-white flex items-center justify-center shadow-sm shrink-0`}><Icon size={18} /></span>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{r.title}</h3>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{KIND_LABEL[r.kind]} roadmap</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{r.description}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-gray-400">roadmap.sh/{r.slug}</span>
        <ArrowUpRight size={15} className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
      </div>
    </a>
  );
}

const PREVIEW = 16;

export default function RoadmapGrid() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kind, setKind] = useState("all");
  const [domain, setDomain] = useState("all");
  const [q, setQ] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios.get("/api/v1/learning/roadmaps").then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const all = useMemo(() => data?.roadmaps || [], [data]);
  const recommended = useMemo(() => all.filter((r) => r.recommended), [all]);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter((r) =>
      (kind === "all" || r.kind === kind) &&
      (domain === "all" || r.domain === domain) &&
      (!s || r.title.toLowerCase().includes(s) || r.slug.includes(s) || r.description.toLowerCase().includes(s)));
  }, [all, kind, domain, q]);
  const domains = useMemo(() => {
    const counts = {};
    for (const r of all) counts[r.domain] = (counts[r.domain] || 0) + 1;
    return Object.keys(data?.domains || {}).filter((d) => counts[d]).map((d) => ({ key: d, label: data.domains[d], n: counts[d] }));
  }, [all, data]);
  const grouped = domain === "all" && kind === "all" && !q.trim();

  return (
    <section id="roadmaps" className="scroll-mt-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-white dark:text-gray-900 flex items-center justify-center shadow-lg shrink-0"><MapIcon size={20} /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Career roadmaps</p>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Every roadmap on roadmap.sh</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              Community-built, step-by-step guides for roles and skills, from Frontend and Backend to DevOps, AI and DSA.
              {all.length > 0 && <> {all.length} roadmaps · opens on roadmap.sh.</>}
            </p>
          </div>
        </div>
        <div className="relative md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roadmaps…" aria-label="Search roadmaps"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-indigo-400" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {KINDS.map((k) => <Chip key={k.key} active={kind === k.key} onClick={() => setKind(k.key)}>{k.label}</Chip>)}
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
        <button type="button" onClick={() => setDomain("all")} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${domain === "all" ? "border-indigo-400 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10" : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-300"}`}>All topics</button>
        {domains.map((d) => (
          <button key={d.key} type="button" onClick={() => setDomain(d.key)} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${domain === d.key ? "border-indigo-400 text-indigo-600 dark:text-indigo-300 bg-indigo-500/10" : "border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-indigo-300"}`}>
            {d.label} <span className="text-gray-400 font-normal">{d.n}</span>
          </button>
        ))}
      </div>

      {loading ? <CardGridSkeleton count={8} /> : !all.length ? (
        <EmptyState icon={<MapIcon size={20} />} title="Roadmaps are unavailable right now">Browse them directly on <a href="https://roadmap.sh/roadmaps" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">roadmap.sh</a>.</EmptyState>
      ) : (
        <>
          {grouped && recommended.length > 0 && (
            <div className="mb-8 rounded-2xl border border-indigo-200/70 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.04] p-4 md:p-5">
              <p className="mb-3 text-sm font-bold text-gray-900 dark:text-white inline-flex items-center gap-1.5"><Sparkles size={15} className="text-indigo-500" /> Recommended for club members</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">{recommended.map((r) => <RoadmapCard key={r.slug} r={r} />)}</div>
            </div>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={<Search size={20} />} title="No roadmap matches">Try another keyword or filter.</EmptyState>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {(grouped && !showAll ? filtered.slice(0, PREVIEW) : filtered).map((r) => <RoadmapCard key={r.slug} r={r} />)}
              </div>
              {grouped && !showAll && filtered.length > PREVIEW && (
                <div className="mt-5 text-center">
                  <button type="button" onClick={() => setShowAll(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-indigo-400 hover:text-indigo-600 transition">
                    Show all {filtered.length} roadmaps
                  </button>
                </div>
              )}
            </>
          )}
          <p className="mt-6 text-xs text-gray-400">
            Roadmaps by <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-500">roadmap.sh</a> (open source on GitHub: kamranahmedse/developer-roadmap). The list refreshes daily{data?.source === "bundled" ? "; showing a saved copy right now" : ""}.
          </p>
        </>
      )}
    </section>
  );
}
