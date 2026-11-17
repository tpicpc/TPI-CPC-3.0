"use client";

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { userApi } from "@/lib/api-client";
import { fmtDateTime } from "@/lib/club-format";
import { Award, CalendarCheck, CheckCircle2, Download, LoaderCircle, MapPin, QrCode, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MyEventsPage() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = () =>
    userApi().get("/api/v1/me/events").then(({ data }) => data.success && setRegs(data.registrations)).catch(() => toast.error("Couldn't load events")).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const cancel = async (r) => {
    if (!window.confirm(`Cancel your registration for "${r.event.title}"?`)) return;
    try {
      await userApi().delete(`/api/v1/event/${r.event._id}/register`);
      toast.success("Registration cancelled");
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const upcoming = regs.filter((r) => !r.ended);
  const past = regs.filter((r) => r.ended);

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-1 text-gray-900 dark:text-white flex items-center gap-2"><CalendarCheck className="text-indigo-500" /> My events</h1>
      <p className="text-sm text-muted-foreground mb-6">Show your QR pass at the entrance. Certificates unlock automatically after events you attend.</p>

      {loading ? (
        <div className="py-16 flex justify-center"><LoaderCircle className="animate-spin text-indigo-500" /></div>
      ) : regs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <CalendarCheck className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No registrations yet</p>
          <p className="text-sm text-gray-500 mt-1">Browse <Link href="/events" className="text-indigo-500 hover:underline">upcoming events</Link> and register in one click.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Upcoming</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {upcoming.map((r) => (
                  <Card key={r._id} className="overflow-hidden">
                    <div className="flex">
                      <img src={r.event.eventImage} alt="" className="w-28 sm:w-36 object-cover shrink-0" />
                      <div className="p-4 flex-1 min-w-0">
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{r.event.eventType}</p>
                        <Link href={`/events/${r.event._id}`} className="font-bold line-clamp-2 hover:text-indigo-600">{r.event.title}</Link>
                        <p className="text-xs text-gray-500 mt-1">{fmtDateTime(r.startsAt)}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11} /> {r.event.location}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {r.status === "attended" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600"><CheckCircle2 size={14} /> Checked in</span>
                          ) : (
                            <>
                              <Button size="sm" onClick={() => setOpen(r)}><QrCode size={14} className="mr-1.5" /> Show pass</Button>
                              <Button size="sm" variant="outline" onClick={() => cancel(r)}>Cancel</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Past events</h2>
              <Card className="divide-y">
                {past.map((r) => (
                  <div key={r._id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{r.event.title}</p>
                      <p className="text-xs text-gray-500">{fmtDateTime(r.startsAt)} · {r.status === "attended" ? <span className="text-green-600 font-medium">Attended</span> : "Not checked in"}</p>
                    </div>
                    {r.certificateNumber ? (
                      <div className="flex gap-2">
                        <Button size="sm" asChild><a href={`/api/v1/certificates/pdf/${r.certificateNumber}`}><Download size={14} className="mr-1.5" /> Certificate PDF</a></Button>
                        <Button size="sm" variant="outline" asChild><Link href={`/certificate/${r.certificateNumber}`} target="_blank"><Award size={14} className="mr-1.5" /> Verify</Link></Button>
                      </div>
                    ) : r.status === "attended" ? (
                      <span className="text-xs text-gray-500">Certificate not available for this event</span>
                    ) : null}
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 px-6 py-5 text-white">
              <button onClick={() => setOpen(null)} className="absolute top-3 right-3 text-white/80 hover:text-white" aria-label="Close"><X size={18} /></button>
              <p className="text-xs uppercase tracking-widest opacity-80">Event pass</p>
              <p className="font-bold text-lg leading-snug mt-1">{open.event.title}</p>
              <p className="text-xs opacity-90 mt-1">{fmtDateTime(open.startsAt)} · {open.event.location}</p>
            </div>
            <div className="p-6 text-center">
              <img src={open.qr} alt="Check-in QR code" className="mx-auto w-56 h-56 rounded-lg border" />
              <p className="mt-4 text-xs text-gray-500">Check-in code</p>
              <p className="font-mono text-2xl font-bold tracking-[0.3em]">{open.code}</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{open.name}</p>
              <a href={open.qr} download={`TPI-CPC-pass-${open.code}.png`} className="mt-4 inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"><Download size={14} /> Save QR image</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
