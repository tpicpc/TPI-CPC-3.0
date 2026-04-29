"use client";

import { CardGridSkeleton, ProfileHeroSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { getDefaultAvatar } from "@/lib/avatars";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { ArrowLeft, BadgeCheck, BookOpen, Calendar, FolderGit2, Heart, Newspaper } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function MemberProfilePage() {
  const { handle } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`/api/v1/members/${handle}`);
        if (data.success) setData(data);
      } finally { setLoading(false); }
    })();
  }, [handle]);

  if (loading) return (
    <div className="px-4 md:px-10 container mx-auto py-10">
      <ProfileHeroSkeleton />
      <div className="mt-8"><CardGridSkeleton count={3} /></div>
    </div>
  );
  if (!data) return <div className="px-4 md:px-10 container mx-auto py-16 text-center">Member not found.</div>;

  const { member, projects, blogs, enrollments, stats } = data;

  return (
    <div className="px-4 md:px-10 container mx-auto py-10">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-indigo-500 hover:underline mb-6">
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-blue-500/10 backdrop-blur-sm p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shrink-0">
            <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-950 bg-gray-100">
              <img src={member.profileImage || getDefaultAvatar()} alt={member.fullName} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{member.fullName}</h1>
              {member.emailVerified && <BadgeCheck className="text-green-500" size={20} />}
            </div>
            {member.username && (
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">@{member.username}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {member.department || "Member"}
              {member.shift ? ` · ${member.shift} shift` : ""}
              {member.session ? ` · Session ${member.session}` : ""}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
              <Calendar size={12} /> Joined {formatDate(member.createdAt)}
            </p>

            <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 mt-5">
              <Stat icon={<FolderGit2 size={16} />} label="Projects" value={stats.count} accent="indigo" />
              <Stat icon={<Heart size={16} />} label="Total likes" value={stats.totalLikes} accent="rose" />
              <Stat icon={<Newspaper size={16} />} label="Blogs" value={stats.blogs} accent="amber" />
              <Stat icon={<BookOpen size={16} />} label="Courses" value={stats.enrollments} accent="emerald" />
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      <Section title="Projects" icon={<FolderGit2 size={18} />} count={projects.length}>
        {projects.length === 0 ? (
          <Empty>No public projects yet.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p._id} href={`/projects/${p._id}`} className="group rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold line-clamp-2 text-gray-900 dark:text-white">{p.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Heart size={11} /> {p.likeCount}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Blogs */}
      <Section title="Blog posts" icon={<Newspaper size={18} />} count={blogs.length}>
        {blogs.length === 0 ? (
          <Empty>No published posts yet.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((b) => (
              <Link key={b._id} href={`/blogs/${b._id}`} className="group rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold line-clamp-2 text-gray-900 dark:text-white">{b.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(b.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Enrolled courses */}
      <Section title="Enrolled courses" icon={<BookOpen size={18} />} count={enrollments.length}>
        {enrollments.length === 0 ? (
          <Empty>Hasn't enrolled in any courses yet.</Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map((e) => (
              <Link key={e._id} href={`/workshop/${e.workshop.slug}`} className="group rounded-xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm overflow-hidden hover:shadow-xl transition-all">
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img src={e.workshop.thumbnail} alt={e.workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold line-clamp-2 text-gray-900 dark:text-white">{e.workshop.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{e.workshop.category} · {e.workshop.level}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Stat({ icon, label, value, accent }) {
  const colors = {
    indigo: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
    rose: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
    emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors[accent] || colors.indigo}`}>
      {icon}
      <div className="text-xs">
        <div className="font-bold text-base leading-none">{value}</div>
        <div className="opacity-80 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Section({ title, icon, count, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
        {icon} {title}
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">{count}</span>
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">{children}</CardContent></Card>;
}
