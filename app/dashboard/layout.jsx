"use client";

import MemberSidebar from "@/components/dashboard/Sidebar";
import { useTheme } from "@/contexts/ThemeContext";
import { useUser } from "@/contexts/UserContext";
import { LoaderCircle, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const { userData, loading, logout } = useUser();
  const { darkMode, setDarkMode } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/dashboard");
  }, [userData, loading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={userData} onLogout={handleLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-700 dark:text-gray-300">
              <Menu size={22} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-500">← Back to site</Link>
              <button onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
