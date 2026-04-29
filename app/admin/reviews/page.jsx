"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, Clock, Edit, LoaderCircle, Save, Trash2, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending review" },
  { key: "approved", label: "Approved" },
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [editing, setEditing] = useState(null); // null | review id
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/review/list?status=${tab}`);
      if (data.success) setReviews(data.reviews);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [tab]);

  const counts = useMemo(() => {
    const c = { all: reviews.length, pending: 0, approved: 0 };
    reviews.forEach((r) => { if (r.approved) c.approved++; else c.pending++; });
    return c;
  }, [reviews]);

  const startEdit = (r) => {
    setEditing(r._id);
    setForm({
      fullName: r.fullName, department: r.department, semester: r.semester,
      shift: r.shift, reviewMessage: r.reviewMessage,
    });
  };
  const cancel = () => { setEditing(null); setForm({}); };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await adminApi().put(`/api/v1/review/${editing}`, form);
      if (data.success) { toast.success("Updated"); cancel(); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const onApprove = async (id, approved) => {
    try {
      const { data } = await adminApi().put(`/api/v1/review/${id}`, { approved });
      if (data.success) {
        toast.success(approved ? "Approved & published" : "Unpublished");
        load();
      }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete review?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/review/${id}`);
      if (data.success) { toast.success("Deleted"); load(); }
    } catch (err) { toast.error("Failed"); }
  };

  const badge = (approved) => approved ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400">
      <CheckCircle2 size={11} /> Approved
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
      <Clock size={11} /> Pending
    </span>
  );

  return (
    <div>
      <PageHeader title="Reviews" description="Member testimonials. Approve to publish on /testimonials." />

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
      ) : reviews.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No reviews in this view.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <Card key={r._id} className={!r.approved ? "border-l-4 border-l-amber-500" : ""}>
              <CardContent className="p-4">
                {editing === r._id ? (
                  <form onSubmit={onSave} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Full name</Label>
                      <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Dept</Label>
                        <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sem</Label>
                        <Input value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Shift</Label>
                        <Input value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Message</Label>
                      <Textarea rows={4} value={form.reviewMessage} onChange={(e) => setForm({ ...form, reviewMessage: e.target.value })} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={cancel}><X size={14} className="mr-1" /> Cancel</Button>
                      <Button type="submit" size="sm" disabled={saving}>
                        {saving ? <LoaderCircle className="animate-spin" size={14} /> : <><Save size={14} className="mr-1" /> Save</>}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {r.profileImage ? (
                          <img src={r.profileImage} alt={r.fullName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{r.fullName.slice(0, 2).toUpperCase()}</div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.fullName}</div>
                          <div className="text-xs text-muted-foreground truncate">{r.department} · {r.semester} · {formatDate(r.createdAt)}</div>
                        </div>
                      </div>
                      {badge(r.approved)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{r.reviewMessage}</p>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex-wrap">
                      {!r.approved ? (
                        <Button size="sm" onClick={() => onApprove(r._id, true)} className="bg-green-600 hover:bg-green-700 text-white">
                          <CheckCircle2 size={14} className="mr-1" /> Approve
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => onApprove(r._id, false)}>
                          <XCircle size={14} className="mr-1" /> Unpublish
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                        <Edit size={13} className="mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDelete(r._id)} className="text-red-600 ml-auto">
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog />
    </div>
  );
}
