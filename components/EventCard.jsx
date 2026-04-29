"use client";

import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, MapPin, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

function getCountdown(startTime) {
  if (!startTime) return null;
  const target = new Date(startTime).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return { days, hours, mins };
}

function Countdown({ startTime }) {
  const [c, setC] = useState(() => getCountdown(startTime));
  useEffect(() => {
    const t = setInterval(() => setC(getCountdown(startTime)), 60000);
    return () => clearInterval(t);
  }, [startTime]);
  if (!c) return null;
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-300 mt-1">
      <Calendar size={11} />
      {c.days > 0 ? `${c.days}d ${c.hours}h to go` : c.hours > 0 ? `${c.hours}h ${c.mins}m to go` : `${c.mins}m to go`}
    </div>
  );
}

export default function EventCard({ event, layout = "vertical" }) {
  const isUpcoming = event.status === "Upcoming";
  const isOngoing = event.status === "Ongoing";

  const statusBadge = isUpcoming ? (
    <span className="upcoming-badge inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/40">
      <Sparkles size={11} /> Upcoming
    </span>
  ) : isOngoing ? (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-700 dark:text-yellow-300">
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" /> Live now
    </span>
  ) : (
    <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
      Completed
    </span>
  );

  const containerCls = isUpcoming
    ? "upcoming-card rounded-xl bg-gradient-to-br from-white via-indigo-50/40 to-violet-50/40 dark:from-gray-950 dark:via-indigo-950/40 dark:to-violet-950/40 overflow-hidden flex flex-col relative"
    : "rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all flex flex-col";

  if (layout === "horizontal") {
    return (
      <div className={`${containerCls} md:flex-row`}>
        <div className="relative md:w-56 shrink-0 overflow-hidden">
          <img src={event.eventImage} alt={event.title} className="w-full h-48 md:h-full object-cover" />
          {isUpcoming && <span className="upcoming-shine" />}
        </div>
        <div className="p-5 flex-1">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{event.eventType}</span>
            {statusBadge}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{event.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{event.description}</p>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 space-y-1">
            <div className="flex items-center gap-1.5"><Clock size={12} /> {formatDateTime(event.startTime)}</div>
            <div className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</div>
            {isUpcoming && <Countdown startTime={event.startTime} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerCls}>
      <div className="relative aspect-video overflow-hidden">
        <img src={event.eventImage} alt={event.title} className={`w-full h-full object-cover ${isUpcoming ? "transition-transform duration-700 hover:scale-110" : ""}`} />
        {isUpcoming && <span className="upcoming-shine" />}
        {isUpcoming && (
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-black/60 text-white backdrop-blur-sm">
              {event.eventType}
            </span>
            {statusBadge}
          </div>
        )}
      </div>
      <div className="p-5 flex-1 flex flex-col">
        {!isUpcoming && (
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{event.eventType}</span>
            {statusBadge}
          </div>
        )}
        <h3 className={`font-bold line-clamp-2 ${isUpcoming ? "text-lg text-gray-900 dark:text-white" : "text-gray-900 dark:text-white"}`}>
          {event.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3 flex-1">{event.description}</p>
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div className="flex items-center gap-1.5"><Clock size={12} /> {formatDateTime(event.startTime)}</div>
          <div className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</div>
          {isUpcoming && <Countdown startTime={event.startTime} />}
        </div>
      </div>
    </div>
  );
}
