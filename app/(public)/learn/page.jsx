"use client";

import ClubHero, { EmptyState, panel } from "@/components/club/ClubHero";
import { CardGridSkeleton } from "@/components/skeletons";
import { userApi } from "@/lib/api-client";
import { LEVEL_STYLES } from "@/lib/club-format";
import { ArrowRight, CheckCircle2, Compass, Mountain, Route, Sprout, TreePine } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LEVELS = [
  { key: "Beginner", icon: Sprout, blurb: "Syntax, complexity, STL and the classic ad-hoc patterns." },
  { key: "Intermediate", icon: TreePine, blurb: "Core algorithms: binary search, DP, graphs, number theory." },
  { key: "Advanced", icon: Mountain, blurb: "Segment trees, advanced DP, strings and flows for ICPC." },
];

export default function LearnPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi().get("/api/v1/learning").then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const t = { items: 0, done: 0 };
    for (const x of data?.topics || []) { t.items += x.itemCount; t.done += x.done; }
    return t;
  }, [data]);
  const pct = totals.items ? Math.round((totals.done / totals.items) * 100) : 0;

  return (
    <div>
      <ClubHero eyebrow="Practice" icon={<Route size={14} />} title="Learning path"
        subtitle="A guided roadmap from your first loop to ICPC-level algorithms. Every topic has curated problems and resources picked by club mentors.">
        {data?.loggedIn ? (
          <div className={`${panel} max-w-md p-4`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">Your progress</span>
              <span className="text-gray-500">{totals.done} / {totals.items} done</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : !loading && (
          <p className="text-sm text-gray-600 dark:text-gray-300"><Link href="/login?redirect=/learn" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Log in</Link> to track your progress as you go.</p>
        )}
      </ClubHero>

      <div className="px-4 md:px-10 container mx-auto py-10">
        {loading ? <CardGridSkeleton count={6} /> : !data?.topics?.length ? (
          <EmptyState icon={<Compass size={20} />} title="The roadmap is being prepared">Mentors are curating topics — check back soon.</EmptyState>
        ) : (
          <div className="space-y-12">
            {LEVELS.map(({ key, icon: Icon, blurb }, li) => {
              const topics = data.topics.filter((t) => t.level === key);
              if (!topics.length) return null;
              const st = LEVEL_STYLES[key];
              return (
                <section key={key} className="relative">
                  <div className="flex items-start gap-4 mb-5">
                    <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${st.bar} text-white flex items-center justify-center shadow-lg shrink-0`}><Icon size={20} /></span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Stage {li + 1}</p>
                      <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{key}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{blurb}</p>
                    </div>
                  </div>
                  <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:pl-[60px]">
                    {topics.map((t, i) => {
                      const p = t.itemCount ? Math.round((t.done / t.itemCount) * 100) : 0;
                      const complete = t.itemCount > 0 && t.done === t.itemCount;
                      return (
                        <li key={t._id}>
                          <Link href={`/learn/${t.slug}`} className={`${panel} group h-full p-5 flex flex-col hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/40 transition`}>
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.chip}`}>{String(i + 1).padStart(2, "0")}</span>
                              {complete && <CheckCircle2 size={18} className="text-green-500" />}
                            </div>
                            <h3 className="mt-3 font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{t.title}</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{t.description}</p>
                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                              <span>{t.problemCount} problems · {t.itemCount - t.problemCount} resources</span>
                              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition" />
                            </div>
                            {data.loggedIn && (
                              <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                                <div className={`h-full rounded-full bg-gradient-to-r ${st.bar}`} style={{ width: `${p}%` }} />
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
