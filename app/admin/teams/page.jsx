"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { Edit, LoaderCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function TeamListPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/team");
      if (data.success) setTeams(data.teams);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const years = useMemo(() => ["all", ...new Set(teams.map((t) => String(t.year)))].sort((a, b) => b.localeCompare(a)), [teams]);

  const filtered = teams.filter((t) =>
    (filter === "all" || String(t.year) === filter) &&
    t.name.toLowerCase().includes(q.toLowerCase())
  );

  const onDelete = async (id) => {
    const ok = await confirm({ title: "Delete team member?", description: "This cannot be undone." });
    if (!ok) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/team/${id}`);
      if (data.success) { toast.success("Deleted"); load(); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Teams"
        description="Year-based members. Current year shows on /teams; others auto-archive as Ex Team."
        action={<Link href="/admin/teams/new"><Button><Plus size={16} className="mr-1" /> Add member</Button></Link>}
      />

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <button key={y} onClick={() => setFilter(y)} className={`px-3 py-1.5 rounded-full text-sm transition ${
              filter === y ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>
              {y === "all" ? "All years" : y}
            </button>
          ))}
        </div>
        <Input placeholder="Search by name..." value={q} onChange={(e) => setQ(e.target.value)} className="md:max-w-sm md:ml-auto" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No team members. Click <b>Add member</b> to create one.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <Card key={m._id} className="overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-950 bg-gray-100 dark:bg-gray-800">
                    <img src={m.memberProfile || getDefaultAvatar(m.gender)} alt={m.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold truncate">{m.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{m.position}</p>
                  <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{m.year}</span>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <Link href={`/admin/teams/${m._id}`} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800" title="Edit"><Edit size={16} /></Link>
                  <button onClick={() => onDelete(m._id)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600" title="Delete"><Trash2 size={16} /></button>
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
