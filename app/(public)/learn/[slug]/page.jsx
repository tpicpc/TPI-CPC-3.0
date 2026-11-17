"use client";

import { panel } from "@/components/club/ClubHero";
import { ArticleSkeleton } from "@/components/skeletons";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { LEVEL_STYLES } from "@/lib/club-format";
import { ArrowLeft, ArrowRight, BookOpen, Check, Code2, Dumbbell, ExternalLink, GraduationCap, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const KIND = {
  problem: { icon: Code2, label: "Problem" },
  practice: { icon: Dumbbell, label: "Practice set" },
  article: { icon: BookOpen, label: "Article" },
  video: { icon: PlayCircle, label: "Video" },
  course: { icon: GraduationCap, label: "Course" },
};

export default function TopicPage() {
  const { slug } = useParams();
  const { userData } = useUser();
  const [data, setData] = useState(null);
  const [done, setDone] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await userApi().get(`/api/v1/learning/${slug}`);
      if (data.success) { setData(data); setDone(new Set(data.done)); }
    } catch {} finally { setLoading(false); }
  }, [slug]);
  useEffect(() => { load(); }, [load, userData]);

  const toggle = async (item) => {
    if (!data.loggedIn) return toast("Log in to track your progress", { icon: "🔒" });
    const next = !done.has(item._id);
    setDone((s) => { const n = new Set(s); next ? n.add(item._id) : n.delete(item._id); return n; });
    try {
      const { data: r } = await userApi().post(`/api/v1/learning/${slug}/progress`, { itemId: item._id, done: next });
      setDone(new Set(r.done));
    } catch { toast.error("Couldn't save progress"); load(); }
  };

  if (loading) return <div className="px-4 md:px-10 container mx-auto py-10 max-w-4xl"><ArticleSkeleton /></div>;
  if (!data) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Topic not found.</div>;
  const { topic, prev, next } = data;
  const st = LEVEL_STYLES[topic.level];
  const pct = topic.items.length ? Math.round((done.size / topic.items.length) * 100) : 0;
  const groups = [
    { title: "Learn", items: topic.items.filter((i) => !["problem", "practice"].includes(i.kind)) },
    { title: "Solve", items: topic.items.filter((i) => ["problem", "practice"].includes(i.kind)) },
  ].filter((g) => g.items.length);

  return (
    <div className="px-4 md:px-10 container mx-auto py-8 md:py-10 max-w-4xl">
      <Link href="/learn" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-5"><ArrowLeft size={16} /> Learning path</Link>
      <div className={`${panel} p-6 md:p-8 relative overflow-hidden`}>
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${st.bar}`} />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.chip}`}>{topic.level}</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{topic.title}</h1>
        {topic.description && <p className="mt-2 text-gray-600 dark:text-gray-300 leading-relaxed">{topic.description}</p>}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>{data.loggedIn ? "Your progress" : "Log in to track progress"}</span><span>{done.size}/{topic.items.length} · {pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${st.bar} transition-all`} style={{ width: `${pct}%` }} /></div>
        </div>
      </div>

      {groups.map((g) => (
        <section key={g.title} className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">{g.title}</h2>
          <ul className="space-y-2">
            {g.items.map((item) => {
              const K = KIND[item.kind] || KIND.problem;
              const isDone = done.has(item._id);
              return (
                <li key={item._id} className={`${panel} p-3.5 flex items-center gap-3 ${isDone ? "opacity-80" : ""}`}>
                  <button onClick={() => toggle(item)} aria-label={isDone ? "Mark not done" : "Mark done"}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition ${isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-300 dark:border-white/20 hover:border-indigo-400"}`}>
                    {isDone && <Check size={14} strokeWidth={3} />}
                  </button>
                  <K.icon size={16} className="text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <a href={item.url || "#"} target="_blank" rel="noopener noreferrer" className={`font-medium text-sm hover:text-indigo-600 dark:hover:text-indigo-400 ${isDone ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>{item.title}</a>
                    <p className="text-xs text-gray-500 truncate">{[K.label, item.platform, item.difficulty, item.note].filter(Boolean).join(" · ")}</p>
                  </div>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-500 shrink-0" aria-label="Open"><ExternalLink size={15} /></a>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="mt-10 grid grid-cols-2 gap-3">
        {prev ? <Link href={`/learn/${prev.slug}`} className={`${panel} p-4 text-sm hover:border-indigo-300`}><span className="text-xs text-gray-500 inline-flex items-center gap-1"><ArrowLeft size={12} /> Previous</span><p className="font-semibold truncate">{prev.title}</p></Link> : <span />}
        {next && <Link href={`/learn/${next.slug}`} className={`${panel} p-4 text-sm text-right hover:border-indigo-300`}><span className="text-xs text-gray-500 inline-flex items-center gap-1">Next <ArrowRight size={12} /></span><p className="font-semibold truncate">{next.title}</p></Link>}
      </div>
    </div>
  );
}
