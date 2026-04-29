"use client";

import { ArticleSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { formatDateTime } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, Award, Check, CheckCircle2, Eye, LoaderCircle, MessageSquare, Send, ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userData } = useUser();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchQ = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`/api/v1/questions/${id}`, { headers });
      if (data.success) setQuestion(data.question);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchQ(); /* eslint-disable-next-line */ }, [id]);

  const requireAuth = () => {
    if (!userData) { router.push(`/login?redirect=/forum/${id}`); return false; }
    return true;
  };

  const voteQuestion = async () => {
    if (!requireAuth()) return;
    const token = localStorage.getItem("token");
    const { data } = await axios.post(`/api/v1/questions/${id}/vote`, {}, { headers: { Authorization: `Bearer ${token}` } });
    if (data.success) setQuestion((q) => ({ ...q, upvoted: data.upvoted, voteCount: data.voteCount }));
  };

  const voteAnswer = async (aId) => {
    if (!requireAuth()) return;
    const token = localStorage.getItem("token");
    const { data } = await axios.patch(`/api/v1/questions/${id}/answer/${aId}`, { action: "vote" }, { headers: { Authorization: `Bearer ${token}` } });
    if (data.success) setQuestion((q) => ({
      ...q,
      answers: q.answers.map((a) => a._id === aId ? { ...a, upvoted: data.upvoted, voteCount: data.voteCount } : a),
    }));
  };

  const acceptAnswer = async (aId) => {
    if (!requireAuth()) return;
    const token = localStorage.getItem("token");
    const { data } = await axios.patch(`/api/v1/questions/${id}/answer/${aId}`, { action: "accept" }, { headers: { Authorization: `Bearer ${token}` } });
    if (data.success) {
      toast.success(data.accepted ? "Answer accepted" : "Acceptance removed");
      fetchQ();
    } else toast.error(data.message);
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (answerText.trim().length < 20) return toast.error("Answer too short");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`/api/v1/questions/${id}/answer`, { body: answerText }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { setAnswerText(""); fetchQ(); toast.success("Answer posted"); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSubmitting(false); }
  };

  const deleteAnswer = async (aId) => {
    const token = localStorage.getItem("token");
    const { data } = await axios.delete(`/api/v1/questions/${id}/answer/${aId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (data.success) fetchQ();
  };

  if (loading) return (
    <div className="px-4 md:px-10 container mx-auto py-10 max-w-4xl">
      <ArticleSkeleton />
    </div>
  );
  if (!question) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Question not found.</div>;

  const isAsker = userData && String(question.asker) === String(userData._id);

  return (
    <div className="px-4 md:px-10 container mx-auto py-10 max-w-4xl">
      <Link href="/forum" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to forum
      </Link>

      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{question.title}</h1>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Eye size={12} /> {question.views} views</span>
        <span>· asked {formatDateTime(question.createdAt)}</span>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {(question.tags || []).map((t) => (
          <Link key={t} href={`/forum?tag=${t}`} className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/25">#{t}</Link>
        ))}
      </div>

      {/* Question */}
      <div className="mt-6 flex gap-5">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button onClick={voteQuestion} className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${question.upvoted ? "bg-indigo-500 text-white border-indigo-500" : "hover:bg-gray-100 dark:hover:bg-white/10"}`}>
            <ThumbsUp size={16} />
          </button>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{question.voteCount}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{question.body}</p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
            <Link href={`/members/${question.asker}`}><img src={question.askerAvatar || "/avatar-neutral.svg"} alt={question.askerName} className="w-7 h-7 rounded-full" /></Link>
            <Link href={`/members/${question.asker}`} className="text-sm font-medium hover:underline">{question.askerName}</Link>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div className="mt-10">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquare size={18} /> {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
        </h2>
        <div className="space-y-6">
          {question.answers.map((a) => (
            <div key={a._id} className={`flex gap-5 rounded-xl p-4 border ${a.accepted ? "border-green-500/40 bg-green-500/5" : "border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5"}`}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <button onClick={() => voteAnswer(a._id)} className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${a.upvoted ? "bg-indigo-500 text-white border-indigo-500" : "hover:bg-gray-100 dark:hover:bg-white/10"}`}>
                  <ThumbsUp size={16} />
                </button>
                <span className="text-sm font-bold">{a.voteCount}</span>
                {isAsker && (
                  <button onClick={() => acceptAnswer(a._id)} title="Accept this answer" className={`mt-1 w-9 h-9 rounded-full flex items-center justify-center border transition ${a.accepted ? "bg-green-500 text-white border-green-500" : "hover:bg-green-50 dark:hover:bg-green-500/10 text-gray-400 hover:text-green-500"}`}>
                    <Check size={16} />
                  </button>
                )}
                {!isAsker && a.accepted && (
                  <CheckCircle2 size={20} className="text-green-500 mt-1" title="Accepted answer" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                {a.accepted && <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mb-2"><Award size={13} /> Accepted answer</div>}
                <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{a.body}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <Link href={`/members/${a.author}`}><img src={a.authorAvatar || "/avatar-neutral.svg"} className="w-6 h-6 rounded-full" alt="" /></Link>
                    <Link href={`/members/${a.author}`} className="text-sm hover:underline">{a.authorName}</Link>
                    <span className="text-xs text-gray-500">· {formatDateTime(a.createdAt)}</span>
                  </div>
                  {userData && String(a.author) === String(userData._id) && (
                    <button onClick={() => deleteAnswer(a._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {question.answers.length === 0 && <p className="text-center text-sm text-gray-500 py-8">No answers yet. Be the first to help!</p>}
        </div>
      </div>

      {/* Answer form */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Your Answer</h3>
        {userData ? (
          <form onSubmit={submitAnswer} className="space-y-3">
            <Textarea rows={6} value={answerText} onChange={(e) => setAnswerText(e.target.value)} placeholder="Write your answer here. Include code samples, links, and explanations." />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                {submitting ? <LoaderCircle className="animate-spin" size={14} /> : <><Send size={14} className="mr-1.5" /> Post Answer</>}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">Sign in to answer this question</p>
            <Link href={`/login?redirect=/forum/${id}`}><Button size="sm">Sign in</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}
