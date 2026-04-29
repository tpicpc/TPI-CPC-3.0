"use client";

import { CardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { CheckCircle2, Clock, ExternalLink, FolderGit2, Heart, LoaderCircle, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/me/projects", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setProjects(data.projects);
      } finally { setLoading(false); }
    })();
  }, []);

  const badge = (status) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-700 dark:text-green-400"><CheckCircle2 size={11} /> Live</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 dark:text-red-400"><XCircle size={11} /> Rejected</span>;
    return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400"><Clock size={11} /> Pending</span>;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FolderGit2 className="text-violet-500" /> My Projects
        </h1>
        <Link href="/submit-project"><Button className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"><Plus size={15} className="mr-1.5" /> New project</Button></Link>
      </div>
      {loading ? (
        <CardGridSkeleton count={3} />
      ) : projects.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <FolderGit2 className="mx-auto text-gray-400 mb-3" size={32} />
          <p className="font-medium text-gray-700 dark:text-gray-300">No projects yet</p>
          <Link href="/submit-project" className="text-indigo-500 hover:underline text-sm mt-2 inline-block">Submit your first one →</Link>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <Card key={p._id} className="overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">{badge(p.status)}</div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Heart size={11} /> {p.likeCount}</span>
                  <span>{formatDate(p.createdAt)}</span>
                </p>
                {p.status === "rejected" && p.rejectionReason && (
                  <p className="text-xs text-red-600 mt-2 italic">Reason: {p.rejectionReason}</p>
                )}
                {p.status === "approved" && (
                  <Link href={`/projects/${p._id}`} target="_blank" className="inline-flex items-center gap-1 text-xs text-indigo-500 mt-3 hover:underline">
                    <ExternalLink size={12} /> View public page
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
