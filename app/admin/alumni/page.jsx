"use client";

/* eslint-disable @next/next/no-img-element */
import CrudManager, { Pill } from "@/components/admin/CrudManager";
import { Button } from "@/components/ui/button";
import { getDefaultAvatar } from "@/lib/avatars";
import { Check, Star, X } from "lucide-react";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "company", label: "Company", required: true },
  { name: "position", label: "Position" },
  { name: "batch", label: "Batch / session", placeholder: "2019-20" },
  { name: "department", label: "Department" },
  { name: "location", label: "Location" },
  { name: "linkedin", label: "LinkedIn URL", type: "url" },
  { name: "photo", label: "Photo URL", type: "url", span: 2 },
  { name: "quote", label: "Advice for juniors", type: "textarea", rows: 2, span: 3 },
  { name: "status", label: "Status", type: "select", options: ["approved", "pending", "rejected"] },
  { name: "featured", label: "Featured (shown first)", type: "checkbox" },
];
const defaults = { name: "", company: "", position: "", batch: "", department: "", location: "", linkedin: "", photo: "", quote: "", status: "approved", featured: false };

export default function AdminAlumniPage() {
  return (
    <CrudManager
      title="Alumni"
      description="Manage the alumni directory. Member submissions arrive as pending and need approval."
      endpoint="/api/v1/admin/alumni"
      listKey="alumni"
      fields={fields}
      defaults={defaults}
      newLabel="Add alumnus"
      tabs={[
        { label: "Pending", filter: (a) => a.status === "pending", alert: true },
        { label: "Approved", filter: (a) => a.status === "approved" },
        { label: "Rejected", filter: (a) => a.status === "rejected" },
      ]}
      emptyText="No alumni in this list."
      renderItem={(a, { update }) => (
        <div className="flex items-start gap-3">
          <img src={a.photo || getDefaultAvatar()} alt="" className="w-11 h-11 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold flex items-center gap-1.5">{a.name} {a.featured && <Star size={13} className="text-amber-500 fill-amber-500" />}</p>
            <p className="text-sm text-muted-foreground">{[a.position, a.company].filter(Boolean).join(" @ ")}</p>
            <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
              {a.batch && <span>Batch {a.batch}</span>}{a.department && <span>· {a.department}</span>}{a.location && <span>· {a.location}</span>}
              {a.user && <Pill tone="indigo">Member submitted</Pill>}
            </div>
            {a.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => update(a, { status: "approved" }, "Approved")} className="bg-green-600 hover:bg-green-700 text-white"><Check size={14} className="mr-1" /> Approve</Button>
                <Button size="sm" variant="outline" onClick={() => update(a, { status: "rejected" }, "Rejected")}><X size={14} className="mr-1" /> Reject</Button>
              </div>
            )}
          </div>
        </div>
      )}
    />
  );
}
