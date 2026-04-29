"use client";

import { ArticleSkeleton, ListRowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, ExternalLink, Github, Heart, LoaderCircle, MessageSquare, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userData } = useUser();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeShot, setActiveShot] = useState(0);
  const [liking, setLiking] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`/api/v1/project/${id}`, { headers });
      if (data.success) setProject(data.project);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); /* eslint-disable-next-line */ }, [id]);

  const onLike = async () => {
    if (!userData) { router.push(`/login?redirect=/projects/${id}`); return; }
    setLiking(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`/api/v1/project/${id}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) setProject((p) => ({ ...p, liked: data.liked, likeCount: data.likeCount }));
    } finally {
      setLiking(false);
    }
  };

  const onComment = async (e) => {
    e.preventDefault();
    if (!userData) { router.push(`/login?redirect=/projects/${id}`); return; }
    if (commentText.trim().length < 2) return toast.error("Comment is too short");
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(`/api/v1/project/${id}/comment`, { text: commentText }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setProject((p) => ({ ...p, comments: [...p.comments, data.comment] }));
        setCommentText("");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.delete(`/api/v1/project/${id}/comment/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        setProject((p) => ({ ...p, comments: p.comments.filter((c) => c._id !== commentId) }));
        toast.success("Deleted");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  if (loading) return (
    <div className="px-4 md:px-10 container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2"><ArticleSkeleton /></div>
      <div className="space-y-3"><ListRowSkeleton /></div>
    </div>
  );
  if (!project) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Project not found.</div>;

  const screenshots = project.screenshots?.length ? project.screenshots : [project.coverImage];

  return (
    <div className="px-4 md:px-10 container mx-auto py-10">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-6">
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="aspect-video rounded-xl overflow-hidden border bg-gray-100 dark:bg-gray-800 relative">
              <img src={screenshots[activeShot]} alt={project.title} className="w-full h-full object-cover" />
            </div>
            {screenshots.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
                {screenshots.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveShot(i)}
                    className={`shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition ${i === activeShot ? "border-indigo-500" : "border-transparent opacity-70 hover:opacity-100"}`}
                  >
                    <img src={s} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(project.tags || []).map((t) => (
                <span key={t} className="text-xs px-2 py-1 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">#{t}</span>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{project.title}</h1>
            <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">{project.description}</p>

            <div className="flex items-center flex-wrap gap-3 mt-6">
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                    <ExternalLink size={15} className="mr-1.5" /> Live demo
                  </Button>
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    <Github size={15} className="mr-1.5" /> GitHub
                  </Button>
                </a>
              )}
              <button
                onClick={onLike}
                disabled={liking}
                className={`flex items-center gap-2 px-4 h-10 rounded-md border transition ${
                  project.liked
                    ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                    : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 hover:border-red-300"
                }`}
              >
                <Heart size={16} fill={project.liked ? "currentColor" : "none"} /> {project.likeCount}
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-900 dark:text-white mb-4">
              <MessageSquare size={18} /> Comments
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                {project.comments?.length || 0}
              </span>
            </h3>

            {userData ? (
              <form onSubmit={onComment} className="flex gap-3 items-start mb-6">
                <img src={userData.profileImage || "/avatar-neutral.svg"} alt={userData.fullName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                <div className="flex-1">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    placeholder="Share your thoughts..."
                    className="resize-none"
                  />
                  <div className="flex items-center justify-end mt-2">
                    <Button type="submit" disabled={submitting} size="sm">
                      {submitting ? <LoaderCircle className="animate-spin" size={14} /> : <><Send size={14} className="mr-1" /> Post</>}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="rounded-md bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 mb-6 flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Sign in to leave a comment</p>
                <Link href={`/login?redirect=/projects/${id}`}><Button size="sm">Sign in</Button></Link>
              </div>
            )}

            <div className="space-y-4">
              {(project.comments || []).slice().reverse().map((c) => {
                const canDelete = userData && (
                  String(c.user) === String(userData._id) ||
                  String(project.owner?._id) === String(userData._id)
                );
                return (
                  <div key={c._id} className="flex gap-3">
                    <Link href={`/members/${c.user}`}>
                      <img src={c.avatar || "/avatar-neutral.svg"} alt={c.name} className="w-9 h-9 rounded-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="rounded-xl bg-gray-100 dark:bg-white/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Link href={`/members/${c.user}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:underline">{c.name}</Link>
                          {canDelete && (
                            <button onClick={() => onDeleteComment(c._id)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line">{c.text}</p>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 ml-1">{formatDate(c.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
              {(!project.comments || project.comments.length === 0) && (
                <p className="text-center text-sm text-gray-500 py-6">No comments yet — be the first to share your thoughts.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — author info */}
        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          {project.owner && (
            <Link href={`/members/${project.owner._id}`} className="block rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-5 hover:bg-white dark:hover:bg-white/10 transition">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Created by</p>
              <div className="flex items-center gap-3">
                <img
                  src={project.owner.profileImage || "/avatar-neutral.svg"}
                  alt={project.owner.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-gray-900"
                />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{project.owner.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{project.owner.department}{project.owner.shift ? ` · ${project.owner.shift} shift` : ""}</p>
                </div>
              </div>
              <p className="text-xs text-indigo-500 mt-3">View profile →</p>
            </Link>
          )}

          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm p-5 text-sm">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Submitted</p>
            <p className="text-gray-700 dark:text-gray-300">{formatDate(project.createdAt)}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
