"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Edit, LoaderCircle, Plus, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/blog/list?status=${tab}`);
      if (data.success) setBlogs(data.blogs);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [tab]);

  const counts = useMemo(() => {
    const c = { all: blogs.length, pending: 0, approved: 0, rejected: 0 };
    blogs.forEach((b) => { if (c[b.status] !== undefined) c[b.status]++; });
    return c;
  }, [blogs]);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete blog?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/blog/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onApprove = async (id) => {
    try {
      const { data } = await adminApi().put(`/api/v1/blog/${id}/moderate`, { action: "approve" });
      if (data.success) { toast.success("Approved & published"); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onReject = async (id) => {
    const ok = await confirm({
      title: "Reject this blog?",
      description: "It won't appear publicly. The user can revise and resubmit.",
      confirmText: "Reject",
    });
    if (!ok) return;
    try {
      const { data } = await adminApi().put(`/api/v1/blog/${id}/moderate`, { action: "reject" });
      if (data.success) { toast.success("Rejected"); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const statusBadge = (s) => {
    if (s === "pending") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400"><Clock size={11} /> Pending</span>;
    if (s === "rejected") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400"><XCircle size={11} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400"><CheckCircle2 size={11} /> Published</span>;
  };

  return (
    <div>
      <PageHeader
        title="Blogs"
        description="Articles & tutorials. User-submitted posts appear in Pending review until approved."
        action={<Link href="/admin/blogs/new"><Button><Plus size={16} className="mr-1" /> New post</Button></Link>}
      />

      <div className="flex flex-wrap items-center gap-2 mb-5 border-b border-gray-200 dark:border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-medium transition ${
              tab === t.key
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {t.label}
            {t.key === "pending" && counts.pending > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-[10px] font-bold w-5 h-5 rounded-full bg-amber-500 text-white">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : blogs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No blogs in this view.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {blogs.map((b) => (
            <Card key={b._id} className={b.status === "pending" ? "border-l-4 border-l-amber-500" : ""}>
              <CardContent className="p-4 flex gap-4">
                <img src={b.image} alt={b.title} className="w-24 h-24 object-cover rounded shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {statusBadge(b.status)}
                    {b.submittedBy && <span className="text-[11px] text-gray-500">User submission</span>}
                  </div>
                  <h3 className="font-bold line-clamp-2">{b.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    By {b.author || "TPI CPC"} · {formatDate(b.createdAt)}
                  </p>
                  {b.status === "rejected" && b.rejectionReason && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 italic">Reason: {b.rejectionReason}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {b.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => onApprove(b._id)} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle2 size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onReject(b._id)} className="text-red-600">
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {b.status === "rejected" && (
                      <Button size="sm" onClick={() => onApprove(b._id)} className="bg-green-600 hover:bg-green-700 text-white">
                        <CheckCircle2 size={14} className="mr-1" /> Approve
                      </Button>
                    )}
                    <Link href={`/admin/blogs/${b._id}`}><Button variant="outline" size="sm"><Edit size={14} /></Button></Link>
                    <Button variant="outline" size="sm" onClick={() => onDelete(b._id)} className="text-red-600"><Trash2 size={14} /></Button>
                  </div>
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
