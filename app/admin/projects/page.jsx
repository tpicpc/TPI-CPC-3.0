"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Edit, ExternalLink, Github, Heart, LoaderCircle, MessageSquare, Star, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/project/list?status=${tab}`);
      if (data.success) setProjects(data.projects);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [tab]);

  const counts = useMemo(() => {
    const c = { all: projects.length, pending: 0, approved: 0, rejected: 0 };
    projects.forEach((p) => { if (c[p.status] !== undefined) c[p.status]++; });
    return c;
  }, [projects]);

  const moderate = async (id, action, reason = "") => {
    try {
      const { data } = await adminApi().put(`/api/v1/project/${id}/moderate`, { action, reason });
      if (data.success) { toast.success("Updated"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onApprove = (id) => moderate(id, "approve");
  const onReject = async (id) => {
    if (!(await confirm({ title: "Reject this project?", confirmText: "Reject" }))) return;
    moderate(id, "reject");
  };
  const onToggleFeatured = async (p) => {
    try {
      const { data } = await adminApi().put(`/api/v1/project/${p._id}/moderate`, { featured: !p.featured });
      if (data.success) { toast.success(data.project.featured ? "Featured" : "Unfeatured"); load(); }
    } catch (err) { toast.error("Failed"); }
  };
  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete project?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/project/${id}`);
      if (data.success) { toast.success("Deleted"); load(); }
    } catch (err) { toast.error("Failed"); }
  };

  const statusBadge = (s) => {
    if (s === "pending") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400"><Clock size={11} /> Pending</span>;
    if (s === "rejected") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400"><XCircle size={11} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400"><CheckCircle2 size={11} /> Live</span>;
  };

  return (
    <div>
      <PageHeader title="Project Showcase" description="Member-submitted projects. Approve to publish on /projects." />

      <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-gray-200 dark:border-white/10">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-medium transition ${
              tab === t.key ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t.label}
            {t.key === "pending" && counts.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full bg-amber-500 text-white">{counts.pending}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : projects.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No projects.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <Card key={p._id} className={p.status === "pending" ? "border-l-4 border-l-amber-500" : ""}>
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {statusBadge(p.status)}
                  {p.featured && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700"><Star size={11} className="inline mr-1" />Featured</span>}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{p.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">By {p.owner?.fullName || "Unknown"} · {formatDate(p.createdAt)}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Heart size={12} /> {p.likeCount || 0}</span>
                  {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500"><ExternalLink size={12} /> Demo</a>}
                  {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1"><Github size={12} /> Code</a>}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Link href={`/projects/${p._id}`} target="_blank"><Button size="sm" variant="outline">View</Button></Link>
                  <Link href={`/admin/projects/${p._id}/edit`}><Button size="sm" variant="outline"><Edit size={14} className="mr-1" /> Edit</Button></Link>
                  {p.status !== "approved" && <Button size="sm" onClick={() => onApprove(p._id)} className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle2 size={14} className="mr-1" /> Approve</Button>}
                  {p.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => onReject(p._id)} className="text-red-600"><XCircle size={14} className="mr-1" /> Reject</Button>}
                  {p.status === "approved" && (
                    <Button size="sm" variant="outline" onClick={() => onToggleFeatured(p)} className={p.featured ? "text-yellow-600" : ""}>
                      <Star size={14} className="mr-1" /> {p.featured ? "Unfeature" : "Feature"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onDelete(p._id)} className="text-red-600"><Trash2 size={14} /></Button>
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
