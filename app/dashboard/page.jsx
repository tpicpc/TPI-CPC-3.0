"use client";

import { ListRowSkeleton, StatGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { Award, BadgeCheck, BookOpen, FolderGit2, HelpCircle, LoaderCircle, Newspaper, Plus, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardOverview() {
  const { userData } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/v1/me/stats", { headers: { Authorization: `Bearer ${token}` } });
        if (data.success) setStats(data.stats);
      } finally { setLoading(false); }
    })();
  }, []);

  if (!userData) return null;
  const verified = !!userData.emailVerified;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 text-white p-6 md:p-8 mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium opacity-90 flex items-center gap-2">
              <Sparkles size={16} /> Welcome back
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1">{userData.fullName}</h1>
            {userData.username && <p className="text-sm opacity-80 mt-0.5">@{userData.username}</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href="/workshop"><Button variant="outline" className="bg-white/15 text-white border-white/30 hover:bg-white/25">Browse courses</Button></Link>
            <Link href="/submit-project"><Button className="bg-white text-indigo-600 hover:bg-white/90"><Plus size={15} className="mr-1.5" /> Submit Project</Button></Link>
          </div>
        </div>
      </div>

      {/* Email verification banner */}
      {!verified && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-5 py-4 mb-6 flex items-center gap-3 flex-wrap">
          <ShieldAlert className="text-amber-600 shrink-0" size={20} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-700 dark:text-amber-400">Verify your email</p>
            <p className="text-sm text-amber-600/80 dark:text-amber-400/80">You can't enroll in courses or post until you verify your email.</p>
          </div>
          <Link href="/verify-email"><Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Verify now</Button></Link>
        </div>
      )}

      {loading ? (
        <>
          <StatGridSkeleton count={4} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ListRowSkeleton /><ListRowSkeleton />
          </div>
        </>
      ) : stats && (
        <>
          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<BookOpen size={20} />} label="Enrolled courses" value={stats.enrollments} color="bg-indigo-500" href="/dashboard/enrollments" />
            <StatCard icon={<Award size={20} />} label="Certificates" value={stats.certificates} color="bg-amber-500" href="/dashboard/certificates" />
            <StatCard icon={<FolderGit2 size={20} />} label="Projects" value={stats.projects.approved} subtitle={stats.projects.pending ? `${stats.projects.pending} pending` : null} color="bg-violet-500" href="/dashboard/projects" />
            <StatCard icon={<Newspaper size={20} />} label="Blog posts" value={stats.blogs.approved} subtitle={stats.blogs.pending ? `${stats.blogs.pending} pending` : null} color="bg-pink-500" href="/dashboard/blogs" />
          </div>

          {/* Quick actions */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3">Quick actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickAction href="/workshop" icon={<BookOpen size={16} />} label="Find a course" />
                <QuickAction href="/submit-project" icon={<FolderGit2 size={16} />} label="Submit project" />
                <QuickAction href="/submit-blog" icon={<Newspaper size={16} />} label="Write blog" />
                <QuickAction href="/forum/ask" icon={<HelpCircle size={16} />} label="Ask question" />
              </div>
            </CardContent>
          </Card>

          {/* Activity highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <FolderGit2 size={16} className="text-violet-500" /> Project activity
                </h3>
                <div className="space-y-2 text-sm">
                  <Row label="Approved" value={stats.projects.approved} accent="text-green-600" />
                  <Row label="Pending review" value={stats.projects.pending} accent="text-amber-600" />
                  <Row label="Rejected" value={stats.projects.rejected} accent="text-red-600" />
                  <Row label="Total likes" value={stats.projects.totalLikes} accent="text-pink-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Newspaper size={16} className="text-pink-500" /> Blog activity
                </h3>
                <div className="space-y-2 text-sm">
                  <Row label="Published" value={stats.blogs.approved} accent="text-green-600" />
                  <Row label="Pending review" value={stats.blogs.pending} accent="text-amber-600" />
                  <Row label="Rejected" value={stats.blogs.rejected} accent="text-red-600" />
                  <Row label="Forum questions" value={stats.questions} accent="text-indigo-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {verified && (
            <div className="mt-6 rounded-xl border border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 px-5 py-3 flex items-center gap-3">
              <BadgeCheck className="text-green-600" size={20} />
              <p className="text-sm text-green-700 dark:text-green-400">Your email is verified — you have full access to enrollments, posting, and comments.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color, href }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center shrink-0`}>{icon}</div>
            {subtitle && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{subtitle}</span>}
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mt-3">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickAction({ href, icon, label }) {
  return (
    <Link href={href} className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition text-sm font-medium">
      {icon} {label}
    </Link>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600 dark:text-gray-300">{label}</span>
      <span className={`font-bold ${accent}`}>{value}</span>
    </div>
  );
}
