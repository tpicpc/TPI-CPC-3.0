"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Eye, LoaderCircle, MessageSquare, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminForumPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/questions?sort=newest");
      if (data.success) setQuestions(data.questions);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete question?", description: "All answers under it will also be removed." }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/questions/${id}`);
      if (data.success) { toast.success("Deleted"); load(); }
    } catch (err) { toast.error("Failed"); }
  };

  return (
    <div>
      <PageHeader title="Forum" description="Member-asked questions and answers from /forum." />
      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : questions.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No questions yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {questions.map((q) => (
            <Card key={q._id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/forum/${q._id}`} target="_blank" className="font-bold text-gray-900 dark:text-white hover:text-indigo-500 line-clamp-2">{q.title}</Link>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(q.tags || []).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">#{t}</span>)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{q.askerName}</span>
                    <span>·</span>
                    <span>{formatDate(q.createdAt)}</span>
                    <span className="flex items-center gap-1"><ThumbsUp size={10} /> {q.voteCount}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={10} /> {q.answerCount}{q.hasAccepted && <CheckCircle2 size={10} className="text-green-500" />}</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {q.views}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/forum/${q._id}`} target="_blank"><Button variant="outline" size="sm"><Eye size={14} /></Button></Link>
                  <Button variant="outline" size="sm" onClick={() => onDelete(q._id)} className="text-red-600"><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog />
    </div>
  );
}
