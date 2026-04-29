"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { formatDate } from "@/lib/utils";
import {
  BadgeCheck,
  Ban,
  BookOpen,
  CheckCircle2,
  Eye,
  LoaderCircle,
  Mail,
  Pause,
  Phone,
  PlayCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all"); // all | verified | unverified | active | suspended | banned
  const [stats, setStats] = useState({ total: 0, verifiedCount: 0, activeCount: 0, suspendedCount: 0, bannedCount: 0 });
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (filter === "verified") params.set("verified", "true");
      else if (filter === "unverified") params.set("verified", "false");
      else if (["active", "suspended", "banned"].includes(filter)) params.set("status", filter);

      const { data } = await adminApi().get(`/api/v1/admin/users?${params}`);
      if (data.success) {
        setUsers(data.users);
        setStats({
          total: data.total,
          verifiedCount: data.verifiedCount,
          activeCount: data.activeCount || 0,
          suspendedCount: data.suspendedCount || 0,
          bannedCount: data.bannedCount || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); /* eslint-disable-next-line */ }, [q]);

  const onDelete = async (u) => {
    if (!(await confirm({
      title: `Delete ${u.fullName}?`,
      description: "This removes the user and all their enrollments. Cannot be undone.",
    }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/admin/users/${u._id}`);
      if (data.success) { toast.success("User deleted"); load(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onSuspend = async (u) => {
    const reason = window.prompt(
      `Suspend ${u.fullName}?\n\nThey won't be able to log in or post until you reactivate. Optionally enter a reason that will be shown to them.`,
      ""
    );
    if (reason === null) return;
    try {
      const { data } = await adminApi().patch(`/api/v1/admin/users/${u._id}`, { status: "suspended", reason });
      if (data.success) { toast.success(`${u.fullName} suspended`); load(); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onBan = async (u) => {
    if (!(await confirm({
      title: `Ban ${u.fullName}?`,
      description: "This is more severe than a suspension. They lose all access immediately. You can unban later.",
      confirmText: "Ban user",
    }))) return;
    const reason = window.prompt("Reason for ban (optional, shown to the user):", "");
    if (reason === null) return;
    try {
      const { data } = await adminApi().patch(`/api/v1/admin/users/${u._id}`, { status: "banned", reason });
      if (data.success) { toast.success(`${u.fullName} banned`); load(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const onActivate = async (u) => {
    try {
      const { data } = await adminApi().patch(`/api/v1/admin/users/${u._id}`, { status: "active" });
      if (data.success) { toast.success(`${u.fullName} reactivated`); load(); }
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const cards = useMemo(
    () => [
      { label: "Total", value: stats.total, icon: Users, color: "bg-indigo-500" },
      { label: "Active", value: stats.activeCount, icon: ShieldCheck, color: "bg-green-500" },
      { label: "Suspended", value: stats.suspendedCount, icon: Pause, color: "bg-amber-500" },
      { label: "Banned", value: stats.bannedCount, icon: ShieldX, color: "bg-red-500" },
    ],
    [stats]
  );

  const statusBadge = (u) => {
    const s = u.status || "active";
    if (s === "banned") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"><ShieldX size={11} /> Banned</span>;
    if (s === "suspended") return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"><Pause size={11} /> Suspended</span>;
    return u.emailVerified
      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400"><BadgeCheck size={11} /> Active</span>
      : <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400"><ShieldAlert size={11} /> Unverified</span>;
  };

  return (
    <div>
      <PageHeader
        title="Registered Members"
        description="Search, filter, suspend, ban, or delete user accounts."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg ${c.color} text-white flex items-center justify-center shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                  <p className="text-2xl font-bold">{c.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "suspended", label: "Suspended" },
            { key: "banned", label: "Banned" },
            { key: "verified", label: "Verified" },
            { key: "unverified", label: "Unverified" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                filter === f.key
                  ? "bg-indigo-500 text-white"
                  : "bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative md:max-w-sm md:ml-auto w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search name, email, roll, mobile, username..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : users.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No members found.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Member</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Department</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Roll</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Enrolled</th>
                  <th className="text-left px-4 py-3 hidden xl:table-cell">Joined</th>
                  <th className="text-right px-4 py-3 w-44">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const status = u.status || "active";
                  const isActive = status === "active";
                  return (
                    <tr key={u._id} className={`border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition ${!isActive ? "opacity-70" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={u.profileImage || getDefaultAvatar()} alt={u.fullName} className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-gray-900" />
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span className="truncate">{u.fullName}</span>
                              {u.emailVerified && <BadgeCheck size={14} className="text-green-500 shrink-0" />}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1 truncate"><Mail size={11} /> {u.email}</span>
                              {u.mobileNumber && <span className="flex items-center gap-1"><Phone size={11} /> {u.mobileNumber}</span>}
                            </div>
                            {!isActive && u.suspendedReason && (
                              <p className="text-xs text-red-600 dark:text-red-400 italic mt-1 truncate" title={u.suspendedReason}>Reason: {u.suspendedReason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600 dark:text-gray-300">
                        <div>{u.department || "—"}</div>
                        <div className="text-xs text-gray-500">{u.shift ? `${u.shift} shift` : ""}</div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-300">{u.rollNumber || "—"}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{statusBadge(u)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-right">
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                          <BookOpen size={11} /> {u.enrollmentCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${u._id}`} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" title="View details"><Eye size={15} /></Link>
                          {isActive ? (
                            <>
                              <button onClick={() => onSuspend(u)} className="p-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600" title="Suspend"><Pause size={15} /></button>
                              <button onClick={() => onBan(u)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600" title="Ban"><Ban size={15} /></button>
                            </>
                          ) : (
                            <button onClick={() => onActivate(u)} className="p-2 rounded-md hover:bg-green-50 dark:hover:bg-green-500/10 text-green-600" title="Reactivate"><PlayCircle size={15} /></button>
                          )}
                          <button onClick={() => onDelete(u)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-red-600" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <Dialog />
    </div>
  );
}
