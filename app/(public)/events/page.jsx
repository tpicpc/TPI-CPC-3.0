"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import { formatDateTime } from "@/lib/utils";
import axios from "axios";
import { useEffect, useState } from "react";

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

  const filtered = filter === "All" ? events : events.filter((e) => e.status === filter);

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
            <div key={e._id} className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden hover:shadow-xl transition">
              <img src={e.eventImage} alt={e.title} className="w-full h-48 object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">{e.eventType}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    e.status === "Upcoming" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                    e.status === "Ongoing" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}>{e.status}</span>
                </div>
                <h3 className="font-bold text-lg mt-1 line-clamp-2">{e.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">{e.description}</p>
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  📍 {e.location} <br />
                  🕒 {formatDateTime(e.startTime)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
