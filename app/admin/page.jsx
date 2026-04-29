"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { Bell, BookOpen, CalendarDays, GraduationCap, MessageSquare, Newspaper, Trophy, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const cards = [
  { key: "users", label: "Members", icon: Users, color: "bg-blue-500", href: "/admin/users" },
  { key: "teams", label: "Team Members", icon: Users, color: "bg-indigo-500", href: "/admin/teams" },
  { key: "advisors", label: "Advisors", icon: UserCog, color: "bg-violet-500", href: "/admin/advisors" },
  { key: "events", label: "Events", icon: CalendarDays, color: "bg-emerald-500", href: "/admin/events" },
  { key: "workshops", label: "Courses", icon: GraduationCap, color: "bg-amber-500", href: "/admin/workshops" },
  { key: "blogs", label: "Blogs", icon: Newspaper, color: "bg-pink-500", href: "/admin/blogs" },
  { key: "reviews", label: "Reviews", icon: MessageSquare, color: "bg-orange-500", href: "/admin/reviews" },
  { key: "notices", label: "Active Notices", icon: Bell, color: "bg-red-500", href: "/admin/notices" },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy, color: "bg-yellow-500", href: "/admin/leaderboard" },
];

export default function AdminHomePage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await adminApi().get("/api/v1/admin/stats");
        if (data.success) setStats(data.stats);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back — here's what's happening." />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.key} href={c.href}>
              <Card className="hover:shadow-md transition cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg ${c.color} text-white flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                    <p className="text-2xl font-bold">{loading ? "—" : stats[c.key] ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
