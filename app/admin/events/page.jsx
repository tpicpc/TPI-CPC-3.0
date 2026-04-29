"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { Edit, LoaderCircle, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/event/list");
      if (data.success) setEvents(data.events);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = filter === "All" ? events : events.filter((e) => e.status === filter);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete event?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/event/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Events"
        description="Workshops, contests, hackathons & more."
        action={<Link href="/admin/events/new"><Button><Plus size={16} className="mr-1" /> Add event</Button></Link>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "Upcoming", "Ongoing", "Completed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-sm transition ${
            filter === s ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No events.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Card key={e._id} className="overflow-hidden">
              <img src={e.eventImage} alt={e.title} className="w-full h-40 object-cover" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{e.eventType}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    e.status === "Upcoming" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                    e.status === "Ongoing" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}>{e.status}</span>
                </div>
                <h3 className="font-bold line-clamp-2">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{formatDateTime(e.startTime)} · 📍 {e.location}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Link href={`/admin/events/${e._id}`}><Button variant="outline" size="sm"><Edit size={14} className="mr-1" /> Edit</Button></Link>
                  <Button variant="outline" size="sm" onClick={() => onDelete(e._id)} className="text-red-600 hover:text-red-700"><Trash2 size={14} className="mr-1" /> Delete</Button>
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
