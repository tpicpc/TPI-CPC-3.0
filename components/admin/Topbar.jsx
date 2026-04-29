"use client";

import { useAdmin } from "@/contexts/AdminContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Topbar({ onMenuClick }) {
  const { admin, logout } = useAdmin();
  const { darkMode, setDarkMode } = useTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        <button onClick={onMenuClick} className="lg:hidden text-gray-700 dark:text-gray-300">
          <Menu size={22} />
        </button>
        <div className="hidden lg:block" />
        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex items-center gap-2">
            {admin?.adminProfile ? (
              <img src={admin.adminProfile} alt={admin.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                {admin?.name?.slice(0, 2).toUpperCase() || "AD"}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium">{admin?.name}</span>
          </div>
          <button
            onClick={() => { logout(); router.push("/admin/login"); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}
