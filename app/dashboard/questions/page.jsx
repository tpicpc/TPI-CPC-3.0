"use client";

import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { CheckCircle2, Eye, HelpCircle, LoaderCircle, MessageSquare, Plus, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/me/questions", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setQuestions(data.questions);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="text-indigo-500" /> My Questions
        </h1>
        <Link href="/forum/ask"><Button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"><Plus size={15} className="mr-1.5" /> Ask a question</Button></Link>
      </div>
      {loading ? (
        <ListSkeleton count={4} />
      ) : questions.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <HelpCircle className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No questions asked yet</p>
          <Link href="/forum/ask" className="text-indigo-500 hover:underline text-sm mt-2 inline-block">Ask your first question →</Link>
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link key={q._id} href={`/forum/${q._id}`} className="block">
              <Card className="hover:shadow-md transition">
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 hover:text-indigo-500">{q.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(q.tags || []).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">#{t}</span>)}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><ThumbsUp size={11} /> {q.voteCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={11} /> {q.answerCount}{q.hasAccepted && <CheckCircle2 size={11} className="text-green-500" />}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {q.views}</span>
                    <span className="ml-auto">{formatDate(q.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
