"use client";

import SectionTitle from "@/components/SectionTitle";
import { CardGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { ExternalLink, Github, Heart, MessageSquare, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProjectsPage() {
  const router = useRouter();
  const { userData } = useUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/v1/project/list");
        if (data.success) setProjects(data.projects);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => projects.filter((p) =>
      (p.title + " " + (p.tags || []).join(" ") + " " + (p.owner?.fullName || ""))
        .toLowerCase()
        .includes(q.toLowerCase())
    ),
    [projects, q]
  );

  const onSubmit = () => {
    if (userData) router.push("/submit-project");
    else router.push("/login?redirect=/submit-project");
  };

  return (
    <div className="px-4 md:px-10 container mx-auto py-16">
      <SectionTitle
        title="Project Showcase"
        subtitle="Browse projects built by TPI CPC members. Like, comment, and get inspired."
      />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 max-w-5xl mx-auto">
        <div className="relative w-full md:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects, tags, members..."
            className="w-full pl-9 pr-4 py-2.5 rounded-md border bg-background"
          />
        </div>
        <Button onClick={onSubmit} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
          <Plus size={16} className="mr-1.5" /> Submit Your Project
        </Button>
      </div>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No projects yet — be the first to submit one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <Link
              key={p._id}
              href={`/projects/${p._id}`}
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col"
            >
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                {p.featured && <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">★ Featured</span>}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2">{p.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(p.tags || []).slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-300">{t}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 flex-1">{p.description}</p>

                {p.owner && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                    <img
                      src={p.owner.profileImage || "/avatar-neutral.svg"}
                      alt={p.owner.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1">{p.owner.fullName}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Heart size={12} /> {p.likeCount}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-3">
                  {p.demoUrl && (
                    <span className="text-xs flex items-center gap-1 text-indigo-500">
                      <ExternalLink size={12} /> Demo
                    </span>
                  )}
                  {p.githubUrl && (
                    <span className="text-xs flex items-center gap-1 text-gray-500">
                      <Github size={12} /> Code
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
