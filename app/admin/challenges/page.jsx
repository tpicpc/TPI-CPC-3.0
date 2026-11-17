"use client";

/* eslint-disable @next/next/no-img-element */
import CrudManager, { Pill } from "@/components/admin/CrudManager";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { formatDateTime } from "@/lib/utils";
import { BadgeCheck, Check, ExternalLink, LoaderCircle, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const fields = [
  { name: "title", label: "Title", required: true, span: 2 },
  { name: "kind", label: "Type", type: "select", options: ["weekly", "daily"] },
  { name: "difficulty", label: "Difficulty", type: "select", options: ["Easy", "Medium", "Hard"] },
  { name: "points", label: "Points", type: "number" },
  { name: "platform", label: "Judge", type: "select", options: ["codeforces", "codechef", "atcoder", "other"] },
  { name: "problemUrl", label: "Problem URL", type: "url", span: 3, help: "Codeforces problem links enable automatic verification (contest id + index are detected)." },
  { name: "cfContestId", label: "CF contest id (optional)", type: "number" },
  { name: "cfIndex", label: "CF problem index (optional)", placeholder: "C" },
  { name: "published", label: "Published", type: "checkbox" },
  { name: "startsAt", label: "Opens at", type: "datetime" },
  { name: "endsAt", label: "Closes at", type: "datetime" },
  { name: "tags", label: "Tags (comma separated)", type: "tags", span: 3, placeholder: "greedy, math, implementation" },
  { name: "description", label: "Short description / hint", type: "textarea", rows: 3, span: 3 },
  { name: "statement", label: "Problem statement (optional)", type: "textarea", rows: 6, span: 3, help: "Shown in the statement panel on the challenge page. Keep the judge link as the official source." },
  { name: "sampleInput", label: "Sample input", type: "textarea", rows: 3, span: 1 },
  { name: "sampleOutput", label: "Sample output", type: "textarea", rows: 3, span: 1 },
];
const defaults = { title: "", kind: "weekly", difficulty: "Medium", points: 10, platform: "codeforces", problemUrl: "", cfContestId: "", cfIndex: "", published: true, startsAt: "", endsAt: "", description: "", tags: "", statement: "", sampleInput: "", sampleOutput: "" };

function Submissions() {
  const [subs, setSubs] = useState([]);
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/admin/challenges/submissions${status ? `?status=${status}` : ""}`);
      setSubs(data.submissions || []);
    } catch { toast.error("Couldn't load submissions"); } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { load(); }, [load]);
  const review = async (s, st) => {
    let reviewNote;
    if (st === "rejected") { reviewNote = window.prompt("Reason (shown to the member):", "The link isn't an accepted submission for this problem."); if (reviewNote === null) return; }
    try {
      const { data } = await adminApi().patch(`/api/v1/admin/challenges/submissions/${s._id}`, { status: st, reviewNote });
      toast.success(data.message);
      load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        {["pending", "accepted", "rejected", ""].map((s) => (
          <button key={s || "all"} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${status === s ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800"}`}>{s || "all"}</button>
        ))}
      </div>
      {loading ? <div className="py-10 flex justify-center"><LoaderCircle className="animate-spin" /></div> : subs.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">No {status} submissions.</CardContent></Card>
      ) : (
        <Card className="divide-y">
          {subs.map((s) => (
            <div key={s._id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img src={s.user?.profileImage || getDefaultAvatar()} alt="" className="w-9 h-9 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{s.user?.fullName || s.name} <span className="text-muted-foreground font-normal">→ {s.challenge?.title}</span></p>
                  <p className="text-xs text-muted-foreground flex flex-wrap gap-2 items-center">
                    {formatDateTime(s.updatedAt)}
                    {s.user?.handles?.codeforces && <span>CF: {s.user.handles.codeforces}</span>}
                    {s.method === "auto" && <Pill tone="green"><BadgeCheck size={11} /> Auto-verified</Pill>}
                    <Pill tone={s.status === "accepted" ? "green" : s.status === "rejected" ? "red" : "amber"}>{s.status}{s.status === "accepted" ? ` · +${s.points}` : ""}</Pill>
                  </p>
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 inline-flex items-center gap-1 mt-0.5 break-all"><ExternalLink size={11} /> {s.link}</a>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {s.status !== "accepted" && <Button size="sm" onClick={() => review(s, "accepted")} className="bg-green-600 hover:bg-green-700 text-white"><Check size={14} className="mr-1" /> Accept</Button>}
                {s.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => review(s, "rejected")}><X size={14} className="mr-1" /> Reject</Button>}
                {s.status !== "pending" && <Button size="sm" variant="ghost" onClick={() => review(s, "pending")} title="Back to pending"><RotateCcw size={14} /></Button>}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

export default function AdminChallengesPage() {
  const [view, setView] = useState("challenges");
  const tabs = (
    <div className="flex gap-1 mb-5 p-1 rounded-lg bg-gray-100 dark:bg-gray-800 w-fit">
      {[["challenges", "Challenges"], ["submissions", "Review submissions"]].map(([k, l]) => (
        <button key={k} onClick={() => setView(k)} className={`px-4 py-1.5 rounded-md text-sm font-medium ${view === k ? "bg-white dark:bg-gray-950 shadow-sm" : "text-muted-foreground"}`}>{l}</button>
      ))}
    </div>
  );
  if (view === "submissions") return (<div><PageHeader title="Challenges" description="Accepting a submission awards points to the member (profile + hidden leaderboard)." />{tabs}<Submissions /></div>);
  return (
    <CrudManager
      title="Challenges"
      description="Post daily/weekly problems. Accepted solutions award points to the member's profile and the (hidden) leaderboard."
      endpoint="/api/v1/admin/challenges"
      listKey="challenges"
      fields={fields}
      defaults={defaults}
      newLabel="New challenge"
      headerExtra={tabs}
      extraForm={({ extra, setExtra, isNew }) => isNew && (
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!extra.notify} onChange={(e) => setExtra({ ...extra, notify: e.target.checked })} /> Notify all members (notification bell)</label>
      )}
      emptyText="No challenges yet."
      renderItem={(c) => {
        const now = Date.now();
        const state = new Date(c.startsAt) > now ? "Scheduled" : c.endsAt && new Date(c.endsAt) < now ? "Ended" : "Active";
        return (
          <div>
            <p className="font-semibold">{c.title}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1.5">
              <Pill tone={state === "Active" ? "green" : state === "Scheduled" ? "indigo" : "gray"}>{state}</Pill>
              <Pill>{c.kind}</Pill><Pill>{c.difficulty}</Pill><Pill tone="amber">{c.points} pts</Pill>
              {c.cfContestId && <Pill tone="green">Auto-verify {c.cfContestId}{c.cfIndex}</Pill>}
              {!c.published && <Pill>Hidden</Pill>}
              <span>{formatDateTime(c.startsAt)} → {c.endsAt ? formatDateTime(c.endsAt) : "open"}</span>
            </div>
            <p className="text-xs mt-2">
              <span className="text-green-600 font-medium">{c.counts?.accepted || 0} accepted</span>
              {c.counts?.pending ? <span className="text-amber-600 font-medium"> · {c.counts.pending} pending review</span> : null}
            </p>
          </div>
        );
      }}
    />
  );
}
