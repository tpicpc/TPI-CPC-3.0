"use client";

import CrudManager, { Pill } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Check, ExternalLink, Lock, X } from "lucide-react";

const fields = [
  { name: "title", label: "Role title", required: true },
  { name: "company", label: "Company", required: true },
  { name: "kind", label: "Type", type: "select", options: ["Internship", "Full-time", "Part-time", "Contract", "Remote"] },
  { name: "location", label: "Location" },
  { name: "salary", label: "Salary / stipend" },
  { name: "deadline", label: "Deadline", type: "date" },
  { name: "applyUrl", label: "Apply link", type: "url", required: true, span: 2 },
  { name: "tags", label: "Tags (comma separated)", type: "tags" },
  { name: "description", label: "Description", type: "textarea", rows: 4, span: 3 },
  { name: "status", label: "Status", type: "select", options: ["approved", "pending", "rejected", "closed"] },
];
const defaults = { title: "", company: "", kind: "Internship", location: "", salary: "", deadline: "", applyUrl: "", tags: "", description: "", status: "approved" };

export default function AdminJobsPage() {
  return (
    <CrudManager
      title="Jobs & Internships"
      description="Post openings or approve the ones members share. Expired deadlines hide automatically."
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
