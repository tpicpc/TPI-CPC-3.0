"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { adminApi } from "@/lib/api-client";
import { Eye, LoaderCircle, Target, UserCheck, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const RANGES = [6, 12, 24];

export default function AnalyticsPage() {
  const { darkMode } = useTheme();
  const [months, setMonths] = useState(12);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi().get(`/api/v1/admin/analytics?months=${months}`).then(({ data }) => data.success && setData(data)).catch(() => {}).finally(() => setLoading(false));
  }, [months]);

  const axis = { stroke: darkMode ? "#6b7280" : "#9ca3af", fontSize: 12, tickLine: false, axisLine: false };
  const grid = darkMode ? "rgba(255,255,255,0.08)" : "#eef0f4";
  const tip = { contentStyle: { background: darkMode ? "#111827" : "#fff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: 10, fontSize: 12 }, cursor: { fill: darkMode ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.06)" } };

  return (
    <div>
      <PageHeader title="Analytics" description="Growth and engagement across members, blogs, events and challenges."
        action={
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
            {RANGES.map((r) => <button key={r} onClick={() => setMonths(r)} className={`px-3 py-1 rounded-md text-sm font-medium ${months === r ? "bg-white dark:bg-gray-950 shadow-sm" : "text-muted-foreground"}`}>{r}m</button>)}
          </div>
        } />
      {loading && !data ? <div className="py-24 flex justify-center"><LoaderCircle className="animate-spin" /></div> : !data ? <p>Couldn&apos;t load analytics.</p> : (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Kpi icon={Users} color="bg-blue-500" label="Members" value={data.kpis.totalUsers} />
            <Kpi icon={UserPlus} color="bg-indigo-500" label="New this month" value={data.kpis.newThisMonth} />
            <Kpi icon={Eye} color="bg-pink-500" label="Blog reads" value={data.kpis.totalViews.toLocaleString()} />
            <Kpi icon={UserCheck} color="bg-emerald-500" label="Event attendance" value={`${data.kpis.attendanceRate}%`} sub={`${data.kpis.attended}/${data.kpis.registered} checked in`} />
            <Kpi icon={Target} color="bg-amber-500" label="Challenge solvers" value={data.kpis.challengeParticipants} sub={`${data.kpis.acceptedSolutions} accepted`} />
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            <ChartCard title="New members over time" subtitle="Monthly sign-ups and running total">
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={data.growth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} /></linearGradient></defs>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis yAxisId="l" allowDecimals={false} {...axis} />
                  <YAxis yAxisId="r" orientation="right" allowDecimals={false} {...axis} />
                  <Tooltip {...tip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar yAxisId="l" dataKey="newMembers" name="New members" fill="url(#g1)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  <Line yAxisId="r" type="monotone" dataKey="total" name="Total" stroke="#10b981" strokeWidth={2.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Most-read blogs" subtitle="Unique reads per browser session">
              {data.topBlogs.length === 0 ? <Empty>No reads recorded yet.</Empty> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.topBlogs} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke={grid} />
                    <XAxis type="number" allowDecimals={false} {...axis} />
                    <YAxis type="category" dataKey="short" width={150} {...axis} />
                    <Tooltip {...tip} labelFormatter={(_, p) => p?.[0]?.payload?.title} />
                    <Bar dataKey="views" name="Reads" fill="#ec4899" radius={[0, 6, 6, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Event attendance" subtitle="Registered vs. checked in (latest events)">
              {data.attendance.length === 0 ? <Empty>No event registrations yet.</Empty> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.attendance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={grid} />
                    <XAxis dataKey="short" {...axis} interval={0} height={56} tick={{ fontSize: 10, angle: -18, textAnchor: "end" }} />
                    <YAxis allowDecimals={false} {...axis} />
                    <Tooltip {...tip} labelFormatter={(_, p) => p?.[0]?.payload?.title} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="registered" name="Registered" fill="#a5b4fc" radius={[6, 6, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="attended" name="Attended" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Challenge participation" subtitle="Submissions and active members per month">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.participationByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} /><stop offset="100%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={grid} />
                  <XAxis dataKey="month" {...axis} />
                  <YAxis allowDecimals={false} {...axis} />
                  <Tooltip {...tip} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="submissions" name="Submissions" stroke="#f59e0b" strokeWidth={2} fill="url(#g2)" />
                  <Area type="monotone" dataKey="members" name="Members" stroke="#6366f1" strokeWidth={2} fill="url(#g3)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {data.participation.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Per-challenge breakdown</CardTitle></CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase text-muted-foreground bg-gray-50 dark:bg-gray-900"><tr><th className="text-left px-4 py-2">Challenge</th><th className="text-right px-4 py-2">Submissions</th><th className="text-right px-4 py-2">Accepted</th><th className="text-right px-4 py-2">Rate</th></tr></thead>
                  <tbody className="divide-y">
                    {[...data.participation].reverse().map((p) => (
                      <tr key={p._id}><td className="px-4 py-2">{p.title}</td><td className="px-4 py-2 text-right tabular-nums">{p.submissions}</td><td className="px-4 py-2 text-right tabular-nums text-green-600">{p.accepted}</td><td className="px-4 py-2 text-right tabular-nums">{Math.round((p.accepted / p.submissions) * 100)}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">Blog reads are counted from this release onward. <Link href="/admin/challenges" className="text-indigo-500 hover:underline">Manage challenges</Link></p>
        </div>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, color, label, value, sub }) {
  return (
    <Card><CardContent className="p-4 flex items-center gap-3">
      <span className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center shrink-0`}><Icon size={18} /></span>
      <div className="min-w-0"><p className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{label}</p><p className="text-xl font-bold">{value}</p>{sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}</div>
    </CardContent></Card>
  );
}
function ChartCard({ title, subtitle, children }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle>{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}</CardHeader>
      <CardContent className="pl-2 pr-4">{children}</CardContent>
    </Card>
  );
}
function Empty({ children }) {
  return <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">{children}</div>;
}
