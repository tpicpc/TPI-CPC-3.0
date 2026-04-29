"use client";

import EventCard from "@/components/EventCard";
import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

const STATUS_RANK = { Ongoing: 0, Upcoming: 1, Completed: 2 };

function sortByRelevance(list) {
  return [...list].sort((a, b) => {
    const ra = STATUS_RANK[a.status] ?? 3;
    const rb = STATUS_RANK[b.status] ?? 3;
    if (ra !== rb) return ra - rb;
    const ta = new Date(a.startTime).getTime();
    const tb = new Date(b.startTime).getTime();
    if (a.status === "Completed") return tb - ta;
    return ta - tb;
  });
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/event/list");
        if (data.success) setEvents(data.events);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const base = filter === "All" ? events : events.filter((e) => e.status === filter);
    return sortByRelevance(base);
  }, [events, filter]);

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle title="Events" subtitle="Workshops, contests, hackathons & more" />

      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {["All", "Upcoming", "Ongoing", "Completed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm transition ${
              filter === s
                ? "bg-indigo-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500">No events to show.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((e) => (
            <EventCard key={e._id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
