"use client";

import { Pill } from "@/components/admin/CrudManager";
import PageHeader from "@/components/admin/PageHeader";
import QrScanner from "@/components/admin/QrScanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, Award, CheckCircle2, Download, ExternalLink, Keyboard, LoaderCircle, Save, Search, UserCheck, Users, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const pad = (n) => String(n).padStart(2, "0");
const toLocal = (v) => { if (!v) return ""; const d = new Date(v); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };

export default function EventRegistrationsPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [code, setCode] = useState("");
  const [last, setLast] = useState(null);
  const [q, setQ] = useState("");
  const [issuing, setIssuing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi().get(`/api/v1/event/${id}/registrations`);
      if (data.success) {
        setData(data);
        setSettings((s) => s || {
          registrationEnabled: !!data.event.registrationEnabled,
          capacity: data.event.capacity || 0,
          registrationDeadline: toLocal(data.event.registrationDeadline),
          certificatesEnabled: data.event.certificatesEnabled !== false,
        });
      }
    } catch { toast.error("Couldn't load registrations"); } finally { setLoading(false); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const checkin = useCallback(async (raw) => {
    try {
      const { data } = await adminApi().post(`/api/v1/event/${id}/checkin`, { code: raw });
      setLast({ ok: true, already: data.already, msg: data.message, reg: data.registration });
      data.already ? toast(data.message, { icon: "ℹ️" }) : toast.success(data.message);
      setCode("");
      load();
    } catch (err) {
      const msg = err.response?.data?.message || "Check-in failed";
      setLast({ ok: false, msg });
      toast.error(msg);
    }
  }, [id, load]);

  const setStatus = async (r, status) => {
    try {
      await adminApi().patch(`/api/v1/event/${id}/registrations/${r._id}`, { status });
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const { data } = await adminApi().patch(`/api/v1/event/${id}/registrations`, settings);
      toast.success(data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { setSavingSettings(false); }
  };

  const issue = async () => {
    setIssuing(true);
    try {
      const { data } = await adminApi().post(`/api/v1/event/${id}/certificates`);
      toast.success(data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); } finally { setIssuing(false); }
  };

  const exportCsv = () => {
    const rows = [["Name", "Email", "Roll", "Department", "Code", "Status", "Registered", "Checked in", "Certificate"]];
    for (const r of data.registrations) rows.push([r.name, r.email, r.rollNumber, r.department, r.code, r.status, new Date(r.createdAt).toISOString(), r.attendedAt ? new Date(r.attendedAt).toISOString() : "", r.certificateNumber]);
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `registrations-${id}.csv`;
    a.click();
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data?.registrations || []).filter((r) => !s || [r.name, r.email, r.code, r.rollNumber].join(" ").toLowerCase().includes(s));
  }, [data, q]);

  if (loading) return <div className="py-20 flex justify-center"><LoaderCircle className="animate-spin" /></div>;
  if (!data) return <p>Event not found.</p>;
  const { event: ev, stats } = data;

  return (
    <div>
      <Link href="/admin/events" className="inline-flex items-center gap-1 text-sm text-indigo-500 hover:underline mb-3"><ArrowLeft size={14} /> Events</Link>
      <PageHeader title={ev.title} description={`${formatDateTime(ev.startTime)} · ${ev.location}`}
        action={<Button variant="outline" asChild><Link href={`/events/${id}`} target="_blank"><ExternalLink size={15} className="mr-1.5" /> Public page</Link></Button>} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[["Registered", stats.registered, Users, "bg-indigo-500"], ["Checked in", stats.attended, UserCheck, "bg-green-500"],
          ["Attendance", stats.registered ? `${Math.round((stats.attended / stats.registered) * 100)}%` : "—", CheckCircle2, "bg-amber-500"], ["Certificates", stats.certificates, Award, "bg-violet-500"]].map(([l, v, Icon, c]) => (
          <Card key={l}><CardContent className="p-4 flex items-center gap-3">
            <span className={`w-10 h-10 rounded-lg ${c} text-white flex items-center justify-center`}><Icon size={18} /></span>
            <div><p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Check-in</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <QrScanner onScan={checkin} />
              <form onSubmit={(e) => { e.preventDefault(); checkin(code); }} className="space-y-1.5">
                <Label className="flex items-center gap-1.5"><Keyboard size={14} /> Manual code</Label>
                <div className="flex gap-2">
                  <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. K7M2QX9A" className="font-mono tracking-widest" maxLength={20} />
                  <Button type="submit" disabled={!code.trim()}>Check in</Button>
                </div>
              </form>
              {last && (
                <div className={`rounded-lg px-3 py-2.5 text-sm flex items-start gap-2 ${last.ok ? (last.already ? "bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200" : "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-200") : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300"}`}>
                  {last.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <XCircle size={16} className="mt-0.5 shrink-0" />}
                  <div><p className="font-semibold">{last.msg}</p>{last.reg && <p className="text-xs opacity-80">{last.reg.rollNumber} · {last.reg.department}</p>}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {settings && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Registration settings</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={saveSettings} className="space-y-3">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={settings.registrationEnabled} onChange={(e) => setSettings({ ...settings, registrationEnabled: e.target.checked })} /> Online registration open</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5"><Label>Capacity (0 = unlimited)</Label><Input type="number" min={0} value={settings.capacity} onChange={(e) => setSettings({ ...settings, capacity: e.target.value })} /></div>
                    <div className="space-y-1.5"><Label>Deadline</Label><Input type="datetime-local" value={settings.registrationDeadline} onChange={(e) => setSettings({ ...settings, registrationDeadline: e.target.value })} /></div>
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={settings.certificatesEnabled} onChange={(e) => setSettings({ ...settings, certificatesEnabled: e.target.checked })} /> PDF certificates for attendees</label>
                  <Button type="submit" size="sm" disabled={savingSettings}>{savingSettings ? <LoaderCircle size={14} className="animate-spin" /> : <><Save size={14} className="mr-1" /> Save settings</>}</Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="min-w-0">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base">Registrations</CardTitle>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-9 pl-8 pr-3 rounded-md border bg-background text-sm w-40" />
                </div>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={!data.registrations.length}><Download size={14} className="mr-1" /> CSV</Button>
                <Button size="sm" onClick={issue} disabled={issuing || !ev.ended || !stats.attended} title={ev.ended ? "" : "Available after the event ends"}>
                  {issuing ? <LoaderCircle size={14} className="animate-spin" /> : <><Award size={14} className="mr-1" /> Issue certificates</>}
                </Button>
              </div>
            </div>
            {!ev.ended && <p className="text-xs text-muted-foreground">Certificates can be issued once the event ends. Attendees also receive them automatically from their dashboard.</p>}
          </CardHeader>
          <CardContent className="p-0">
            {list.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No registrations yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground bg-gray-50 dark:bg-gray-900">
                    <tr><th className="text-left px-4 py-2">Member</th><th className="text-left px-4 py-2">Code</th><th className="text-left px-4 py-2">Status</th><th className="text-right px-4 py-2">Action</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {list.map((r) => (
                      <tr key={r._id}>
                        <td className="px-4 py-2.5"><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{[r.rollNumber, r.department].filter(Boolean).join(" · ") || r.email}</p></td>
                        <td className="px-4 py-2.5 font-mono text-xs tracking-wider">{r.code}</td>
                        <td className="px-4 py-2.5">
                          <Pill tone={r.status === "attended" ? "green" : r.status === "cancelled" ? "red" : "gray"}>{r.status}</Pill>
                          {r.attendedAt && <p className="text-[11px] text-muted-foreground mt-0.5">{formatDateTime(r.attendedAt)}</p>}
                          {r.certificateNumber && <a href={`/api/v1/certificates/pdf/${r.certificateNumber}?inline=1`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-500 inline-flex items-center gap-0.5 mt-0.5"><Award size={10} /> Certificate</a>}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {r.status === "registered" && <Button size="sm" variant="outline" onClick={() => setStatus(r, "attended")}>Mark present</Button>}
                          {r.status === "attended" && <Button size="sm" variant="ghost" onClick={() => setStatus(r, "registered")}>Undo</Button>}
                          {r.status === "cancelled" && <Button size="sm" variant="ghost" onClick={() => setStatus(r, "registered")}>Restore</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
