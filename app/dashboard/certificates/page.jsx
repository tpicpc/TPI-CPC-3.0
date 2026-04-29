"use client";

import { ListRowSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { Award, ExternalLink, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyCertsDashboard() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/certificates/my", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setCerts(data.certificates);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
        <Award className="text-amber-500" /> My Certificates
      </h1>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><ListRowSkeleton /><ListRowSkeleton /></div>
      ) : certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <Award className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No certificates yet</p>
          <p className="text-sm text-gray-500 mt-1">Complete a course or participate in an event to earn one.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((c) => (
            <Card key={c._id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-500 px-6 py-5 text-white">
                <div className="text-xs uppercase tracking-widest opacity-80">{c.type === "course" ? "Course Completion" : "Event Participation"}</div>
                <h3 className="text-lg font-bold mt-1 line-clamp-2">{c.referenceTitle}</h3>
              </div>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500">Issued {formatDate(c.issuedAt)}</p>
                <p className="font-mono text-xs mt-1 truncate text-gray-600">{c.number}</p>
                {c.instructor && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">By {c.instructor}</p>}
                <Link href={`/certificate/${c.number}`} target="_blank" className="inline-block mt-4">
                  <Button size="sm"><ExternalLink size={14} className="mr-1.5" /> View certificate</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
