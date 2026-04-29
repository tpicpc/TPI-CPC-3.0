"use client";

import SectionTitle from "@/components/SectionTitle";
import { ForumRowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { CheckCircle2, Eye, MessageSquare, Plus, Search, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ForumPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { userData } = useUser();
  const tag = params.get("tag");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const sp = new URLSearchParams();
      if (tag) sp.set("tag", tag);
      if (q) sp.set("q", q);
      sp.set("sort", sort);
      try {
        const { data } = await axios.get(`/api/v1/questions?${sp}`);
        if (data.success) setQuestions(data.questions);
      } finally { setLoading(false); }
    })();
  }, [tag, sort, q]);

  const onAsk = () => {
    if (userData) router.push("/forum/ask");
    else router.push("/login?redirect=/forum/ask");
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-16 max-w-5xl">
      <SectionTitle
        title="Discussion Forum"
        subtitle="Ask questions, share knowledge, upvote helpful answers."
      />

      <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center">
        <div className="flex flex-wrap gap-2">
          {["newest", "top", "unanswered"].map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`px-3 py-1.5 rounded-full text-sm transition capitalize ${
              sort === s ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100"
            }`}>{s}</button>
          ))}
        </div>
        <div className="relative flex-1 md:max-w-sm md:ml-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions..." className="w-full pl-9 pr-4 py-2 rounded-md border bg-background" />
        </div>
        <Button onClick={onAsk} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          <Plus size={16} className="mr-1.5" /> Ask Question
        </Button>
      </div>

      {tag && (
        <div className="mb-4">
          <Link href="/forum" className="text-sm text-indigo-500 hover:underline">← All questions</Link>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Filtered by tag: <span className="font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">#{tag}</span></p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <ForumRowSkeleton key={i} />)}</div>
      ) : questions.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No questions yet — be the first to ask!</p>
      ) : (
        <div className="space-y-3">
          {questions.map((qq) => (
            <Link key={qq._id} href={`/forum/${qq._id}`} className="block rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-5 hover:shadow-lg hover:border-indigo-400/50 transition">
              <div className="flex gap-5">
                <div className="hidden sm:flex flex-col items-center gap-3 text-center text-xs text-gray-500 shrink-0 w-16">
                  <div><div className="font-bold text-base text-gray-900 dark:text-white">{qq.voteCount}</div>votes</div>
                  <div className={qq.hasAccepted ? "text-green-600" : ""}><div className={`font-bold text-base ${qq.hasAccepted ? "text-green-600" : "text-gray-900 dark:text-white"}`}>{qq.answerCount}{qq.hasAccepted && <CheckCircle2 size={12} className="inline ml-0.5" />}</div>answers</div>
                  <div><div className="font-bold text-base text-gray-900 dark:text-white">{qq.views}</div>views</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white hover:text-indigo-500 line-clamp-2">{qq.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(qq.tags || []).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">#{t}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <span>asked by {qq.askerName}</span>
                    <span>·</span>
                    <span>{formatDate(qq.createdAt)}</span>
                    <span className="ml-auto sm:hidden flex items-center gap-3">
                      <span className="flex items-center gap-1"><ThumbsUp size={12} /> {qq.voteCount}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} /> {qq.answerCount}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {qq.views}</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
