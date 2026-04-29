"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  FileText,
  FolderGit2,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Trophy,
  UserCog,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const groups = [
  {
    label: "Overview",
    items: [{ href: "/admin", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", icon: UserCheck, label: "Members" },
      { href: "/admin/teams", icon: Users, label: "Teams" },
      { href: "/admin/advisors", icon: UserCog, label: "Advisors" },
      { href: "/admin/leaderboard", icon: Trophy, label: "Leaderboard" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/events", icon: CalendarDays, label: "Events" },
      { href: "/admin/workshops", icon: GraduationCap, label: "Workshops (LMS)" },
      { href: "/admin/blogs", icon: Newspaper, label: "Blogs" },
      { href: "/admin/projects", icon: FolderGit2, label: "Projects" },
      { href: "/admin/forum", icon: HelpCircle, label: "Forum" },
      { href: "/admin/resources", icon: FileText, label: "Resources" },
      { href: "/admin/certificates", icon: Award, label: "Certificates" },
      { href: "/admin/notices", icon: Bell, label: "Notice Bar" },
      { href: "/admin/reviews", icon: MessageSquare, label: "Reviews" },
    ],
  },
  {
    label: "Inbox",
    items: [{ href: "/admin/contacts", icon: Inbox, label: "Contact Messages" }],
  },
  {
    label: "Account",
    items: [{ href: "/admin/profile", icon: BarChart3, label: "Profile" }],
  },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/40 lg:hidden z-30" />}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-screen w-64 bg-white dark:bg-gray-950 border-r flex flex-col transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              title="Back to main website"
              className="flex items-center gap-2.5 hover:opacity-80 transition"
            >
              <img
                src="/tpicpc_logo.png"
                alt="TPI CPC"
                className="w-9 h-9 rounded-md object-contain"
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Admin
              </span>
            </Link>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-900">
              <X size={20} />
            </button>
          </div>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition"
          >
            <ArrowLeft size={12} /> Back to main site
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{g.label}</div>
              <ul className="space-y-1">
                {g.items.map((it) => {
                  const active = pathname === it.href || (it.href !== "/admin" && pathname.startsWith(it.href));
                  const Icon = it.icon;
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                          active
                            ? "bg-indigo-500 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        <Icon size={18} />
                        {it.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
