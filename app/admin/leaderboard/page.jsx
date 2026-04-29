"use client";

import PageHeader from "@/components/admin/PageHeader";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api-client";
import { Edit, LoaderCircle, Plus, Trash2, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function LeaderboardAdminPage() {
  const [data, setData] = useState({ entries: [], years: [], year: new Date().getFullYear() });
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { confirm, Dialog } = useConfirm();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi().get(`/api/v1/leaderboard/list?year=${year}`);
      if (data.success) setData(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [year]);

  const years = useMemo(() => {
    const set = new Set([year, ...(data.years || []), new Date().getFullYear()]);
    return Array.from(set).sort((a, b) => b - a);
  }, [data.years, year]);

  const onDelete = async (id) => {
    if (!(await confirm({ title: "Remove from leaderboard?" }))) return;
    try {
      const { data } = await adminApi().delete(`/api/v1/leaderboard/${id}`);
      if (data.success) { toast.success("Deleted"); load(); } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  return (
    <div>
      <PageHeader
        title="Leaderboard"
        description="Top performers — managed per year."
        action={<Link href="/admin/leaderboard/new"><Button><Plus size={16} className="mr-1" /> Add entry</Button></Link>}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-sm text-muted-foreground">Year:</span>
        {years.map((y) => (
          <button key={y} onClick={() => setYear(y)} className={`px-3 py-1.5 rounded-full text-sm transition ${
            y === year ? "bg-indigo-500 text-white" : "bg-white dark:bg-gray-800 border hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}>{y}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : data.entries.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No entries for {year}.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 text-sm">
                <tr>
                  <th className="text-left px-4 py-3 w-16">Rank</th>
                  <th className="text-left px-4 py-3">Member</th>
                  <th className="text-right px-4 py-3">Points</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Contributions</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Wins</th>
                  <th className="text-right px-4 py-3 w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.entries.map((e, i) => (
                  <tr key={e._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      {i < 3 ? <Trophy size={18} className={i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : "text-orange-500"} /> : <span className="text-sm">#{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {e.profileImage ? (
                          <img src={e.profileImage} alt={e.name} className="w-9 h-9 rounded-full object-cover" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold">{e.name.slice(0, 2).toUpperCase()}</div>
                        )}
                        <div>
                          <div className="font-medium">{e.name}</div>
                          <div className="text-xs text-muted-foreground">{e.department} {e.handle && `· @${e.handle}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-500">{e.points}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{e.contributions}</td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">{e.contestsWon}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/leaderboard/${e._id}`} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"><Edit size={16} /></Link>
                        <button onClick={() => onDelete(e._id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
      <Dialog />
    </div>
  );
}
