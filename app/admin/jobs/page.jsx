"use client";

import CrudManager, { Pill } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Check, CircleAlert, CircleCheck, ExternalLink, LoaderCircle, Lock, RefreshCw, Rss, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "swe", label: "Software / CSE" },
  { value: "diploma", label: "Diploma engineering" },
  { value: "govt", label: "Government" },
  { value: "other", label: "Other" },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORY_OPTIONS.map((o) => [o.value, o.label]));

function ExternalFeeds() {
  const [sources, setSources] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    try {
      const { data } = await adminApi().get("/api/v1/admin/jobs/refresh");
      setSources(data.sources || []);
    } catch { setSources([]); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const refresh = async () => {
    setBusy(true);
    try {
      const { data } = await adminApi().post("/api/v1/admin/jobs/refresh");
      setSources(data.sources || []);
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Refresh failed"); }
    finally { setBusy(false); }
  };
  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold flex items-center gap-2"><Rss size={16} className="text-indigo-500" /> Auto-updating job feeds</p>
            <p className="text-sm text-muted-foreground">Public sources are fetched on the server and cached for 6 hours. Failed sources are hidden from the public page.</p>
          </div>
          <Button variant="outline" onClick={refresh} disabled={busy}>
            {busy ? <LoaderCircle size={15} className="mr-1.5 animate-spin" /> : <RefreshCw size={15} className="mr-1.5" />} Refresh now
          </Button>
        </div>
        {!sources ? (
          <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2"><LoaderCircle size={14} className="animate-spin" /> Checking sources…</p>
        ) : (
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {sources.map((s) => (
              <div key={s.id} className="rounded-lg border px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <a href={s.home} target="_blank" rel="noopener noreferrer" className="font-medium truncate hover:text-indigo-500">{s.label}</a>
                  {s.ok ? <CircleCheck size={15} className="text-green-500 shrink-0" /> : <CircleAlert size={15} className={`${s.count ? "text-amber-500" : "text-red-500"} shrink-0`} />}
                </div>
                <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[s.category]} · {s.count} listings</p>
                {!s.ok && <p className="text-xs text-red-500 truncate" title={s.error}>{s.count ? "Using last copy: " : "Hidden: "}{s.error}</p>}
                {s.ok && s.fetchedAt && <p className="text-[11px] text-muted-foreground">Updated {formatDate(s.fetchedAt)} {new Date(s.fetchedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</p>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const fields = [
  { name: "title", label: "Role title", required: true },
  { name: "company", label: "Company", required: true },
  { name: "kind", label: "Type", type: "select", options: ["Internship", "Full-time", "Part-time", "Contract", "Remote"] },
  { name: "category", label: "Board", type: "select", options: CATEGORY_OPTIONS },
  { name: "location", label: "Location" },
  { name: "salary", label: "Salary / stipend" },
  { name: "deadline", label: "Deadline", type: "date" },
  { name: "applyUrl", label: "Apply link", type: "url", required: true, span: 2 },
  { name: "tags", label: "Tags (comma separated)", type: "tags" },
  { name: "description", label: "Description", type: "textarea", rows: 4, span: 3 },
  { name: "status", label: "Status", type: "select", options: ["approved", "pending", "rejected", "closed"] },
];
const defaults = { title: "", company: "", kind: "Internship", category: "swe", location: "", salary: "", deadline: "", applyUrl: "", tags: "", description: "", status: "approved" };

export default function AdminJobsPage() {
  return (
    <CrudManager
      title="Jobs & Internships"
      description="Post openings or approve the ones members share. Expired deadlines hide automatically."
      headerExtra={<ExternalFeeds />}
      endpoint="/api/v1/admin/jobs"
      listKey="jobs"
      fields={fields}
      defaults={defaults}
      newLabel="Post a job"
      tabs={[
        { label: "Pending", filter: (j) => j.status === "pending", alert: true },
        { label: "Live", filter: (j) => j.status === "approved" },
        { label: "Closed / rejected", filter: (j) => ["closed", "rejected"].includes(j.status) },
      ]}
      emptyText="No posts in this list."
      renderItem={(j, { update }) => (
        <div>
          <p className="font-semibold">{j.title} <span className="font-normal text-muted-foreground">· {j.company}</span></p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1.5">
            <Pill tone="indigo">{j.kind}</Pill>
            <Pill>{CATEGORY_LABEL[j.category || "swe"]}</Pill>
            {j.location && <span>{j.location}</span>}
            {j.deadline && <span>· Deadline {formatDate(j.deadline)}</span>}
            {j.postedBy && <Pill>By {j.postedBy.fullName}</Pill>}
            <a href={j.applyUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 inline-flex items-center gap-1"><ExternalLink size={11} /> Apply link</a>
          </div>
          {j.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{j.description}</p>}
          <div className="flex gap-2 mt-3">
            {j.status === "pending" && <>
              <Button size="sm" onClick={() => update(j, { status: "approved" }, "Approved")} className="bg-green-600 hover:bg-green-700 text-white"><Check size={14} className="mr-1" /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => update(j, { status: "rejected" }, "Rejected")}><X size={14} className="mr-1" /> Reject</Button>
            </>}
            {j.status === "approved" && <Button size="sm" variant="outline" onClick={() => update(j, { status: "closed" }, "Closed")}><Lock size={14} className="mr-1" /> Close</Button>}
          </div>
        </div>
      )}
    />
  );
}
