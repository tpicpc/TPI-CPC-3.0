"use client";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { AdminProvider, useAdmin } from "@/contexts/AdminContext";
import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PUBLIC_ADMIN_ROUTES = ["/admin/login", "/admin/forgot-password"];

function AdminGate({ children }) {
  const { admin, loading } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !admin && !PUBLIC_ADMIN_ROUTES.includes(pathname)) {
      router.replace("/admin/login");
    }
  }, [admin, loading, pathname, router]);

  if (PUBLIC_ADMIN_ROUTES.includes(pathname)) return children;

  if (loading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return children;
}

function Shell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (PUBLIC_ADMIN_ROUTES.includes(pathname)) return children;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminGate>
        <Shell>{children}</Shell>
      </AdminGate>
    </AdminProvider>
  );
}
