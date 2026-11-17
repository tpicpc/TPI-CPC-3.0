"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userApi } from "@/lib/api-client";
import { fmtDate } from "@/lib/club-format";
import { Award, Download, Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition disabled:opacity-50 ${checked ? "bg-indigo-500" : "bg-gray-300 dark:bg-white/15"}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

// Dashboard → Public profile: choose which certificates appear on the public profile.
export default function CertificateVisibility() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    userApi().get("/api/v1/me/certificates").then(({ data }) => data.success && setData(data)).catch(() => setData({ certificates: [], showCertificates: true }));
  }, []);

  const setAll = async (show) => {
    setBusy("all");
    try {
      const { data: r } = await userApi().patch("/api/v1/me/certificates", { showCertificates: show });
      setData((d) => ({ ...d, showCertificates: r.showCertificates }));
      toast.success(r.message);
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't update"); }
    finally { setBusy(""); }
  };
  const setOne = async (c, visible) => {
    setBusy(c._id);
    try {
      const { data: r } = await userApi().patch("/api/v1/me/certificates", { id: c._id, hidden: !visible });
      setData((d) => ({ ...d, certificates: d.certificates.map((x) => (x._id === c._id ? { ...x, hiddenOnProfile: r.certificate.hiddenOnProfile } : x)) }));
      toast.success(r.message);
    } catch (err) { toast.error(err.response?.data?.message || "Couldn't update"); }
    finally { setBusy(""); }
  };

  const certs = data?.certificates || [];
  const visibleCount = certs.filter((c) => !c.hiddenOnProfile).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2"><Award size={17} className="text-amber-500" /> Certificates on your profile</CardTitle>
            <CardDescription>
              Choose what visitors see. Hidden certificates stay valid; their verify links and PDFs keep working.
            </CardDescription>
          </div>
          {data && certs.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">{data.showCertificates ? "Section visible" : "Section hidden"}</span>
              <Switch checked={data.showCertificates} onChange={setAll} disabled={busy === "all"} label="Show certificates on my profile" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!data ? (
          <p className="text-sm text-muted-foreground flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" /> Loading certificates…</p>
        ) : certs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No certificates yet. Attend an event or finish a course to earn one.</p>
        ) : (
          <>
            {!data.showCertificates && (
              <p className="mb-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-200 px-3 py-2 text-sm flex items-center gap-2">
                <EyeOff size={15} className="shrink-0" /> The certificates section is hidden on your public profile. Your choices below are kept for when you turn it back on.
              </p>
            )}
            <ul className={`divide-y divide-border rounded-lg border ${data.showCertificates ? "" : "opacity-60"}`}>
              {certs.map((c) => {
                const visible = !c.hiddenOnProfile;
                return (
                  <li key={c._id} className="flex items-center gap-3 px-3 py-3">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${visible ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}><Award size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${visible ? "" : "text-muted-foreground"}`}>{c.referenceTitle}</p>
                      <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3">
                        <span>{c.type === "course" ? "Course" : "Event"} · {fmtDate(c.issuedAt)}</span>
                        <Link href={`/certificate/${c.number}`} target="_blank" className="inline-flex items-center gap-1 hover:text-indigo-500"><ShieldCheck size={11} /> Verify</Link>
                        <a href={`/api/v1/certificates/pdf/${c.number}`} className="inline-flex items-center gap-1 hover:text-indigo-500"><Download size={11} /> PDF</a>
                      </p>
                    </div>
                    <span className={`hidden sm:inline-flex items-center gap-1 text-xs ${visible ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                      {visible ? <><Eye size={13} /> Shown</> : <><EyeOff size={13} /> Hidden</>}
                    </span>
                    {busy === c._id ? <LoaderCircle size={16} className="animate-spin text-indigo-500 mx-3" /> : <Switch checked={visible} onChange={(v) => setOne(c, v)} label={`Show ${c.referenceTitle} on my profile`} />}
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">{data.showCertificates ? `${visibleCount} of ${certs.length} shown publicly.` : "0 shown publicly."}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
