"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api-client";
import { BookOpen, Edit, LoaderCircle, Plus, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function WorkshopsAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/workshop/list");
      if (data.success) setItems(data.workshops);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    items
      .filter((w) => filter === "All" || w.status === filter)
      .filter((w) => w.title.toLowerCase().includes(q.toLowerCase())),
  [items, filter, q]);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete this course?", description: "All lessons will be removed." }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/workshop/id/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Workshops (LMS)"
        description="Manage courses, playlists, and lesson videos."
        action={<Link href="/admin/workshops/new"><Button><Plus size={16} className="mr-1" /> New course</Button></Link>}
      />

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {["All", "Published", "Draft"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm transition ${
              filter === s ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>{s}</button>
          ))}
        </div>
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-sm md:ml-auto" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No courses yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((w) => (
            <Card key={w._id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
                <img src={w.thumbnail} alt={w.title} className="w-full h-full object-cover" />
                {w.featured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><Star size={12} /> Featured</span>}
                <span className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${
                  w.status === "Published" ? "bg-green-500 text-white" : "bg-gray-500 text-white"
                }`}>{w.status}</span>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{w.category}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">{w.level}</span>
                </div>
                <h3 className="font-bold line-clamp-2">{w.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <BookOpen size={12} /> {w.lessons?.length || 0} lessons · 👨‍🏫 {w.instructor}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/admin/workshops/${w._id}`}><Button variant="outline" size="sm"><Edit size={14} className="mr-1" /> Edit</Button></Link>
                  <Button variant="outline" size="sm" onClick={() => onDelete(w._id)} className="text-red-600"><Trash2 size={14} /></Button>
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
