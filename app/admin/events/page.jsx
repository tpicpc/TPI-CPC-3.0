"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { ArrowDownUp, Edit, LoaderCircle, Mail, Plus, RotateCcw, Search, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const STATUS_TABS = ["All", "Upcoming", "Ongoing", "Completed"];

export default function EventListPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevance");
  const [announcing, setAnnouncing] = useState(null);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get("/api/v1/event/list");
      if (data.success) setEvents(data.events);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const types = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [events]);

  const counts = useMemo(() => {
    const c = { All: events.length, Upcoming: 0, Ongoing: 0, Completed: 0 };
    events.forEach((e) => {
      if (c[e.status] !== undefined) c[e.status]++;
    });
    return c;
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];
    if (filter !== "All") list = list.filter((e) => e.status === filter);
    if (type !== "all") list = list.filter((e) => e.eventType === type);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.organizer?.toLowerCase().includes(q)
      );
    }
    const statusRank = { Ongoing: 0, Upcoming: 1, Completed: 2 };
    list.sort((a, b) => {
      const ta = new Date(a.startTime).getTime();
      const tb = new Date(b.startTime).getTime();
      switch (sort) {
        case "relevance": {
          // Ongoing first, then upcoming (soonest first), then completed (most recent first)
          const ra = statusRank[a.status] ?? 3;
          const rb = statusRank[b.status] ?? 3;
          if (ra !== rb) return ra - rb;
          if (a.status === "Completed") return tb - ta; // newest completed first
          return ta - tb; // ongoing/upcoming: soonest first
        }
        case "date_asc":
          return ta - tb;
        case "date_desc":
          return tb - ta;
        case "title_asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title_desc":
          return (b.title || "").localeCompare(a.title || "");
        default:
          return 0;
      }
    });
    return list;
  }, [events, filter, type, query, sort]);

  const resetFilters = () => {
    setFilter("All");
    setType("all");
    setQuery("");
    setSort("relevance");
  };

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Delete event?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/event/${id}`);
      if (data.success) {
        toast.success("Deleted");
        load();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const onAnnounce = async (event) => {
    const ok = await confirm({
      title: `Email all members about "${event.title}"?`,
      description:
        "An announcement email will be sent to every verified, non-banned member. This may take a moment for large lists.",
      confirmText: "Send announcement",
    });
    if (!ok) return;
    setAnnouncing(event._id);
    try {
      const { data } = await adminApi().post(`/api/v1/event/${event._id}/announce`);
      if (data.success) {
        toast.success(data.message || `Sent to ${data.sent} members`);
      } else toast.error(data.message || "Failed to send");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send announcements");
    } finally {
      setAnnouncing(null);
    }
  };

  const filtersActive = filter !== "All" || type !== "all" || query.trim() || sort !== "relevance";

  return (
    <div>
      <PageHeader
        title="Events"
        description="Workshops, contests, hackathons & more."
        action={
          <Link href="/admin/events/new">
            <Button>
              <Plus size={16} className="mr-1" /> Add event
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-3 border-b border-gray-200 dark:border-white/10">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2.5 -mb-px border-b-2 text-sm font-medium transition ${
              filter === s
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {s}
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, location, organizer..."
            className="pl-9"
          />
        </div>

        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {types.map((t) => (
              <SelectItem key={t} value={t}>
                {t === "all" ? "All types" : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="md:w-44">
            <span className="flex items-center gap-1.5">
              <ArrowDownUp size={13} />
              <SelectValue placeholder="Sort" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Current first (recommended)</SelectItem>
            <SelectItem value="date_desc">Newest first</SelectItem>
            <SelectItem value="date_asc">Oldest first</SelectItem>
            <SelectItem value="title_asc">Title A→Z</SelectItem>
            <SelectItem value="title_desc">Title Z→A</SelectItem>
          </SelectContent>
        </Select>

        {filtersActive && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw size={13} className="mr-1" /> Reset
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Showing <strong>{filtered.length}</strong> of {events.length} events
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {events.length === 0 ? "No events yet — create your first one." : "No events match these filters."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <Card key={e._id} className="overflow-hidden">
              <img src={e.eventImage} alt={e.title} className="w-full h-40 object-cover" />
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {e.eventType}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      e.status === "Upcoming"
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : e.status === "Ongoing"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {e.status}
                  </span>
                </div>
                <h3 className="font-bold line-clamp-2">{e.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(e.startTime)} · 📍 {e.location}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Link href={`/admin/events/${e._id}`}>
                    <Button variant="outline" size="sm">
                      <Edit size={14} className="mr-1" /> Edit
                    </Button>
                  </Link>
                  {(e.status === "Upcoming" || e.status === "Ongoing") && (
                    <Button
                      size="sm"
                      onClick={() => onAnnounce(e)}
                      disabled={announcing === e._id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      title="Email all members about this event"
                    >
                      {announcing === e._id ? (
                        <LoaderCircle size={14} className="mr-1 animate-spin" />
                      ) : (
                        <Send size={14} className="mr-1" />
                      )}
                      Announce
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(e._id)}
                    className="text-red-600 hover:text-red-700 ml-auto"
                  >
                    <Trash2 size={14} />
                  </Button>
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
