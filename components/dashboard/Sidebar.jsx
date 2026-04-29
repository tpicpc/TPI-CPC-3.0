"use client";

import { cn } from "@/lib/utils";
import {
  Award,
  BookOpen,
  FolderGit2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Newspaper,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/enrollments", icon: BookOpen, label: "My Courses" },
  { href: "/dashboard/certificates", icon: Award, label: "Certificates" },
  { href: "/dashboard/projects", icon: FolderGit2, label: "My Projects" },
  { href: "/dashboard/blogs", icon: Newspaper, label: "My Blogs" },
  { href: "/dashboard/questions", icon: HelpCircle, label: "My Questions" },
];

export default function MemberSidebar({ open, onClose, user, onLogout }) {
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
        <div className="px-5 py-5 border-b flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            TPI CPC
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-gray-900">
            <X size={20} />
          </button>
        </div>

        {user && (
          <div className="px-4 py-4 border-b">
            <div className="flex items-center gap-3">
              <img src={user.profileImage || "/avatar-neutral.svg"} alt={user.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-900" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{user.fullName}</p>
                {user.username && <p className="text-xs text-indigo-500 truncate">@{user.username}</p>}
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((it) => {
              const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow"
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
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
