"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { Edit, LoaderCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdvisorListPage() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/advisor");
      if (data.success) setAdvisors(data.advisors);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete advisor?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/advisor/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Advisors"
        description="Mentors and faculty advisors of the club."
        action={<Link href="/admin/advisors/new"><Button><Plus size={16} className="mr-1" /> Add advisor</Button></Link>}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : advisors.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No advisors yet.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {advisors.map((a) => (
            <Card key={a._id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img src={a.advisorProfile || getDefaultAvatar(a.gender)} alt={a.name} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{a.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{a.position}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/advisors/${a._id}`} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit size={16} /></Link>
                  <button onClick={() => onDelete(a._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600"><Trash2 size={16} /></button>
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
