"use client";

import SectionTitle from "@/components/SectionTitle";
import { faqs } from "@/lib/assets";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function HomeFAQs() {
  const [open, setOpen] = useState(null);
  return (
    <section className="py-16 px-4 md:px-10 container mx-auto">
      <SectionTitle
        title="Frequently Asked Questions"
        subtitle="Common questions answered. If your question isn't listed, feel free to reach out to us using the contact form below."
      />
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((f) => (
          <div key={f.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm overflow-hidden">
            <button onClick={() => setOpen(open === f.id ? null : f.id)} className="w-full flex justify-between items-center text-left px-5 py-4 text-gray-900 dark:text-white">
              <span className="font-medium">{f.title}</span>
              <ChevronDown size={18} className={`transition shrink-0 ml-4 ${open === f.id ? "rotate-180" : ""}`} />
            </button>
            {open === f.id && <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{f.description}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
