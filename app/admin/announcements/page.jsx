"use client";

import CrudManager, { Pill } from "@/components/admin/CrudManager";
import { formatDateTime } from "@/lib/utils";
import { ExternalLink, Mail, Megaphone, Pin } from "lucide-react";
import toast from "react-hot-toast";

const fields = [
  { name: "title", label: "Title", required: true, span: 2 },
  { name: "category", label: "Category", type: "select", options: ["General", "Event", "Contest", "Workshop", "Urgent"] },
  { name: "body", label: "Message", type: "textarea", rows: 5, span: 3 },
  { name: "link", label: "Link (optional)", placeholder: "/events/… or https://…", span: 2 },
  { name: "pinned", label: "Pin to top", type: "checkbox" },
  { name: "published", label: "Published on the notice board", type: "checkbox", span: 3 },
];
const defaults = { title: "", category: "General", body: "", link: "", pinned: false, published: true };

export default function AdminAnnouncementsPage() {
  return (
    <CrudManager
      title="Notice Board"
      description="Post announcements to the public notice board, notify members in-site and (optionally) by email."
      endpoint="/api/v1/admin/announcements"
      listKey="announcements"
      fields={fields}
      defaults={defaults}
      newLabel="New announcement"
      emptyText="No announcements yet."
      extraForm={({ extra, setExtra, isNew }) => (
        <div className="rounded-lg border border-dashed p-3 space-y-2 bg-indigo-50/40 dark:bg-indigo-500/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{isNew ? "Notify members" : "Re-send notification (optional)"}</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" checked={!!extra.notify} onChange={(e) => setExtra({ ...extra, notify: e.target.checked, email: e.target.checked ? extra.email : false })} />
            Send an in-site notification (bell) to all members
          </label>
          <label className={`flex items-center gap-2 text-sm ${extra.notify ? "" : "opacity-50"}`}>
            <input type="checkbox" className="rounded" disabled={!extra.notify} checked={!!extra.email} onChange={(e) => setExtra({ ...extra, email: e.target.checked })} />
            Also email verified members <span className="text-xs text-muted-foreground">(skipped automatically if EMAIL_USER / EMAIL_PASS aren&apos;t set)</span>
          </label>
        </div>
      )}
      onSaved={(data) => {
        const b = data.broadcast;
        if (!b) return;
        toast.success(`Notified ${b.notified} members${b.emailed ? ` · emailed ${b.emailed}` : ""}`);
        if (b.emailSkipped) toast("Email skipped — mail isn't configured on this server", { icon: "✉️" });
      }}
      renderItem={(a) => (
        <div className="flex items-start gap-3">
          <Megaphone size={18} className={a.published ? "text-indigo-500 mt-0.5" : "text-gray-400 mt-0.5"} />
          <div className="min-w-0">
            <p className="font-semibold">{a.title}</p>
            {a.body && <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{a.body}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <Pill tone="indigo">{a.category}</Pill>
              {a.pinned && <Pill tone="amber"><Pin size={11} /> Pinned</Pill>}
              <Pill tone={a.published ? "green" : "gray"}>{a.published ? "Published" : "Draft"}</Pill>
              {a.notifiedAt && <span>🔔 Notified {formatDateTime(a.notifiedAt)}</span>}
              {a.emailedCount > 0 && <span className="inline-flex items-center gap-1"><Mail size={11} /> {a.emailedCount} emails</span>}
              {a.link && <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 inline-flex items-center gap-1"><ExternalLink size={11} /> Link</a>}
              <span>{formatDateTime(a.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
