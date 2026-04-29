"use client";

import SectionTitle from "@/components/SectionTitle";
import { faqs } from "@/lib/assets";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FAQPage() {
  const [open, setOpen] = useState(null);
  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle title="Frequently Asked Questions" subtitle="Quick answers to common questions" />
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden">
            <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full flex justify-between items-center text-left px-5 py-4">
              <span className="font-medium">{f.title}</span>
              <ChevronDown size={18} className={`transition ${open === f.id ? "rotate-180" : ""}`} />
            </button>
            {open === f.id && <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300">{f.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
