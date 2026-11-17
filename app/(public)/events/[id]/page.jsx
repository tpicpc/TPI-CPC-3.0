"use client";

/* eslint-disable @next/next/no-img-element */
import { panel } from "@/components/club/ClubHero";
import { ArticleSkeleton } from "@/components/skeletons";
import { useUser } from "@/contexts/UserContext";
import { userApi } from "@/lib/api-client";
import { fmtDateTime, parseEventTime } from "@/lib/club-format";
import { ArrowLeft, Award, CalendarClock, CalendarPlus, CheckCircle2, Clock, LoaderCircle, MapPin, QrCode, Ticket, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EventDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userData } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await userApi().get(`/api/v1/event/${id}`);
      if (data.success) setData(data);
    } catch {} finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load, userData]);

  if (loading) return <div className="px-4 md:px-10 container mx-auto py-10 max-w-5xl"><ArticleSkeleton /></div>;
  if (!data) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Event not found.</div>;

  const { event: ev, registration: reg, myRegistration: mine } = data;
  const start = parseEventTime(ev.startTime);
  const end = parseEventTime(ev.endTime);
  const registered = mine && mine.status !== "cancelled";
  const seatsLeft = ev.capacity > 0 ? Math.max(0, ev.capacity - reg.registeredCount) : null;

  const register = async () => {
    if (!userData) return router.push(`/login?redirect=/events/${id}`);
    setBusy(true);
    try {
      const { data } = await userApi().post(`/api/v1/event/${id}/register`);
      toast.success(data.message || "Registered");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setBusy(false); }
  };

  const gcal = () => {
    const f = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const e = end || new Date(start.getTime() + 2 * 3600000);
    return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates: `${f(start)}/${f(e)}`, location: ev.location, details: ev.description.slice(0, 500) })}`;
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-8 md:py-10 max-w-6xl">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-5"><ArrowLeft size={16} /> All events</Link>
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <article className="min-w-0">
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video bg-gray-100 dark:bg-gray-900">
            <img src={ev.eventImage} alt={ev.title} className="w-full h-full object-cover" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold">{ev.eventType}</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ev.status === "Completed" ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300" : ev.status === "Ongoing" ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" : "bg-green-500/15 text-green-700 dark:text-green-300"}`}>{ev.status}</span>
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">{ev.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Organized by <span className="font-medium text-gray-700 dark:text-gray-200">{ev.organizer}</span>
            {ev.collaboration ? <> in collaboration with <span className="font-medium text-gray-700 dark:text-gray-200">{ev.collaboration}</span></> : null}
          </p>
          <div className="mt-6 text-[15px] leading-7 text-gray-700 dark:text-gray-300 whitespace-pre-line">{ev.description}</div>
        </article>

        <aside className="lg:sticky lg:top-28 self-start space-y-4">
          <div className={`${panel} p-5 space-y-3 text-sm`}>
            <Row icon={<CalendarClock size={16} />} label="Starts" value={start ? fmtDateTime(start) : ev.startTime} />
            {end && <Row icon={<Clock size={16} />} label="Ends" value={fmtDateTime(end)} />}
            <Row icon={<MapPin size={16} />} label="Location" value={ev.location} />
            {ev.registrationEnabled && (
              <Row icon={<Users size={16} />} label="Registered" value={`${reg.registeredCount}${ev.capacity ? ` / ${ev.capacity}` : ""}${seatsLeft != null && !reg.ended ? ` · ${seatsLeft} seats left` : ""}`} />
            )}
            {ev.certificatesEnabled !== false && ev.registrationEnabled && <Row icon={<Award size={16} />} label="Certificate" value="PDF certificate for attendees" />}
            {start && !reg.ended && (
              <a href={gcal()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-medium hover:underline pt-1">
                <CalendarPlus size={15} /> Add to Google Calendar
              </a>
            )}
          </div>

          {ev.registrationEnabled && (
            <div className={`${panel} p-5`}>
              {registered ? (
                <div>
                  <p className="flex items-center gap-2 font-semibold text-green-600 dark:text-green-400">
                    <CheckCircle2 size={18} /> {mine.status === "attended" ? "You attended this event" : "You're registered"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {mine.status === "attended"
                      ? reg.ended ? "Your certificate is available in your dashboard." : "Enjoy the event!"
                      : <>Check-in code <span className="font-mono font-bold tracking-wider text-gray-900 dark:text-white">{mine.code}</span></>}
                  </p>
                  <Link href="/dashboard/events" className="mt-4 w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold">
                    {mine.status === "attended" ? <><Award size={15} /> My certificates</> : <><QrCode size={15} /> Show my QR pass</>}
                  </Link>
                </div>
              ) : reg.open ? (
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Save your seat</p>
                  <p className="text-sm text-gray-500 mt-1">Free for members. You&apos;ll get a QR pass for quick check-in.</p>
                  <button onClick={register} disabled={busy} className="mt-4 w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 disabled:opacity-60">
                    {busy ? <LoaderCircle size={16} className="animate-spin" /> : <Ticket size={16} />} {userData ? "Register now" : "Log in to register"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{reg.reason}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-indigo-500">{icon}</span>
      <div><p className="text-xs text-gray-500">{label}</p><p className="font-medium text-gray-900 dark:text-white">{value}</p></div>
    </div>
  );
}
