"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Bell, Edit, ExternalLink, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const empty = { message: "", link: "", isActive: true, priority: 0, expiresAt: "" };

export default function NoticesAdminPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/notice/list");
      if (data.success) setNotices(data.notices);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing("new"); setForm(empty); };
  const startEdit = (n) => {
    setEditing(n._id);
    setForm({
      message: n.message,
      link: n.link || "",
      isActive: n.isActive,
      priority: n.priority || 0,
      expiresAt: n.expiresAt ? new Date(n.expiresAt).toISOString().slice(0, 16) : "",
    });
  };

  const cancel = () => { setEditing(null); setForm(empty); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return toast.error("Message is required");
    setSaving(true);
    try {
      const payload = { ...form, expiresAt: form.expiresAt || null };
      const isNew = editing === "new";
      const url = isNew ? "/api/v1/notice" : `/api/v1/notice/${editing}`;
      const method = isNew ? "post" : "put";
      const { data } = await adminApi()[method](url, payload);
      if (data.success) { toast.success(isNew ? "Created" : "Updated"); cancel(); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete notice?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/notice/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const toggleActive = async (n) => {
    try {
      const { data } = await adminApi().put(`/api/v1/notice/${n._id}`, { isActive: !n.isActive });
      if (data.success) { toast.success(`${data.notice.isActive ? "Activated" : "Deactivated"}`); load(); }
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Notice Bar"
        description="Manage the scrolling announcement at the top of the public site."
        action={!editing && <Button onClick={startNew}><Plus size={16} className="mr-1" /> New notice</Button>}
      />

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{editing === "new" ? "New notice" : "Edit notice"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Message *</Label>
                <Textarea rows={2} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="🚀 Workshop registration is now open!" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5"><Label>Link (optional)</Label><Input type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://..." /></div>
                <div className="space-y-1.5"><Label>Priority</Label><Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>Expires at (optional)</Label><Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                Active (show on site)
              </label>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : <><Save size={16} className="mr-1" /> Save</>}</Button>
                <Button type="button" variant="outline" onClick={cancel}><X size={16} className="mr-1" /> Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : notices.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No notices. Create one to show on the public site.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => (
            <Card key={n._id} className={n.isActive ? "" : "opacity-60"}>
              <CardContent className="p-4 flex items-start gap-3">
                <Bell size={18} className={n.isActive ? "text-indigo-500 mt-0.5" : "text-gray-400 mt-0.5"} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{n.message}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded ${n.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                      {n.isActive ? "Active" : "Inactive"}
                    </span>
                    <span>Priority: {n.priority}</span>
                    {n.expiresAt && <span>Expires: {formatDate(n.expiresAt)}</span>}
                    {n.link && <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline flex items-center gap-1"><ExternalLink size={12} /> Link</a>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(n)} className="text-xs px-3 py-1.5 rounded border hover:bg-gray-100 dark:hover:bg-gray-800">
                    {n.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button onClick={() => startEdit(n)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit size={16} /></button>
                  <button onClick={() => onDelete(n._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600"><Trash2 size={16} /></button>
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
