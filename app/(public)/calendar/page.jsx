"use client";

import ClubHero, { Chip, panel } from "@/components/club/ClubHero";
import axios from "axios";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const STYLE = {
  event: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  challenge: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  contest: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
};
const dkey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function CalendarPage() {
  const [items, setItems] = useState([]);
  const [contests, setContests] = useState([]);
  const [showContests, setShowContests] = useState(false);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(() => dkey(new Date()));

  useEffect(() => {
    axios.get("/api/v1/calendar").then(({ data }) => data.success && setItems(data.items)).catch(() => {});
  }, []);
  useEffect(() => {
    if (showContests && !contests.length)
      axios.get("/api/v1/contests").then(({ data }) => data.success && setContests(data.contests.map((c) => ({ id: c.id, type: "contest", title: c.name, subtitle: c.platform, start: c.start, href: c.url, external: true })))).catch(() => {});
  }, [showContests, contests.length]);

  const all = useMemo(() => [...items, ...(showContests ? contests : [])], [items, contests, showContests]);
  const byDay = useMemo(() => {
    const m = {};
    for (const it of all) {
      const k = dkey(new Date(it.start));
      (m[k] ||= []).push(it);
    }
    for (const k in m) m[k].sort((a, b) => new Date(a.start) - new Date(b.start));
    return m;
  }, [all]);

  const cells = useMemo(() => {
    const first = new Date(cursor);
    const start = new Date(first);
    start.setDate(1 - first.getDay());
    return Array.from({ length: 42 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  }, [cursor]);

  const todayKey = dkey(new Date());
  const upcoming = all.filter((i) => new Date(i.start) >= new Date(new Date().setHours(0, 0, 0, 0))).sort((a, b) => new Date(a.start) - new Date(b.start)).slice(0, 8);
  const selectedItems = byDay[selected] || [];

  return (
    <div>
      <ClubHero eyebrow="Community" icon={<CalendarDays size={14} />} title="Club calendar" subtitle="Workshops, contests, meetups and challenge windows — all in one place.">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-full border ${STYLE.event}`}>Club events</span>
          <span className={`px-2.5 py-1 rounded-full border ${STYLE.challenge}`}>Challenges</span>
          <Chip active={showContests} onClick={() => setShowContests((v) => !v)}>{showContests ? "✓ " : "+ "}Online contests</Chip>
        </div>
      </ClubHero>
      <div className="px-4 md:px-10 container mx-auto py-8 grid lg:grid-cols-[1fr_320px] gap-8">
        <div className={`${panel} p-3 md:p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
            <div className="flex gap-1">
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="w-9 h-9 rounded-lg border border-gray-200 dark:border-white/10 inline-flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5" aria-label="Previous month"><ChevronLeft size={16} /></button>
              <button onClick={() => { const d = new Date(); setCursor(new Date(d.getFullYear(), d.getMonth(), 1)); setSelected(todayKey); }} className="h-9 px-3 rounded-lg border border-gray-200 dark:border-white/10 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5">Today</button>
              <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="w-9 h-9 rounded-lg border border-gray-200 dark:border-white/10 inline-flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5" aria-label="Next month"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">{DAYS.map((d) => <div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
            {cells.map((d) => {
              const k = dkey(d);
              const list = byDay[k] || [];
              const inMonth = d.getMonth() === cursor.getMonth();
              return (
                <button key={k} onClick={() => setSelected(k)}
                  className={`min-h-[64px] md:min-h-[96px] p-1 md:p-1.5 text-left align-top bg-white dark:bg-gray-950 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 transition ${selected === k ? "ring-2 ring-inset ring-indigo-500" : ""} ${inMonth ? "" : "opacity-40"}`}>
                  <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-semibold ${k === todayKey ? "bg-indigo-500 text-white" : "text-gray-700 dark:text-gray-300"}`}>{d.getDate()}</span>
                  <div className="mt-0.5 space-y-0.5 hidden md:block">
                    {list.slice(0, 3).map((it) => <div key={it.id} className={`truncate rounded px-1 py-0.5 text-[10px] font-medium border ${STYLE[it.type]}`}>{it.title}</div>)}
                    {list.length > 3 && <div className="text-[10px] text-gray-500 px-1">+{list.length - 3} more</div>}
                  </div>
                  <div className="mt-1 flex gap-0.5 md:hidden">{list.slice(0, 3).map((it) => <span key={it.id} className={`w-1.5 h-1.5 rounded-full ${it.type === "event" ? "bg-indigo-500" : it.type === "challenge" ? "bg-orange-500" : "bg-sky-500"}`} />)}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{new Date(selected.split("-")[0], selected.split("-")[1], selected.split("-")[2]).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            {selectedItems.length === 0 ? <p className="text-sm text-gray-500">Nothing scheduled.</p> : <ItemList items={selectedItems} />}
          </div>
        </div>
        <aside className="lg:sticky lg:top-28 self-start">
          <div className={`${panel} p-5`}>
            <h2 className="font-bold text-gray-900 dark:text-white mb-3">Coming up</h2>
            {upcoming.length === 0 ? <p className="text-sm text-gray-500">Nothing scheduled yet.</p> : <ItemList items={upcoming} showDate />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ItemList({ items, showDate }) {
  return (
    <ul className="space-y-2">
      {items.map((it) => {
        const Icon = it.type === "event" ? MapPin : it.type === "challenge" ? Target : Trophy;
        const inner = (
          <>
            <span className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${STYLE[it.type]}`}><Icon size={14} /></span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-900 dark:text-white truncate">{it.title}</span>
              <span className="block text-xs text-gray-500 truncate capitalize">
                {showDate && `${new Date(it.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · `}
                {new Date(it.start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} · {it.subtitle}
              </span>
            </span>
          </>
        );
        return (
          <li key={it.id}>
            {it.external
              ? <a href={it.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-gray-50 dark:hover:bg-white/5">{inner}</a>
              : <Link href={it.href} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-gray-50 dark:hover:bg-white/5">{inner}</Link>}
          </li>
        );
      })}
    </ul>
  );
}
