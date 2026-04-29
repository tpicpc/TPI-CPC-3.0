"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import axios from "axios";
import { Award, ExternalLink, LoaderCircle, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminCertificatesPage() {
  const [certs, setCerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [form, setForm] = useState({ userId: "", type: "course", referenceId: "", grade: "" });
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    try {
      const [c, u, w, e] = await Promise.all([
        adminApi().get("/api/v1/certificates"),
        adminApi().get("/api/v1/admin/users"),
        adminApi().get("/api/v1/workshop/list?status=Published"),
        adminApi().get("/api/v1/event/list"),
      ]);
      if (c.data.success) setCerts(c.data.certificates);
      if (u.data.success) setUsers(u.data.users);
      if (w.data.success) setCourses(w.data.workshops);
      if (e.data.success) setEvents(e.data.events);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const onIssue = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.referenceId) return toast.error("Pick a member and a course/event");
    setIssuing(true);
    try {
      const { data } = await adminApi().post("/api/v1/certificates", form);
      if (data.success) {
        toast.success(data.alreadyIssued ? "Already issued" : "Certificate issued");
        setShowForm(false);
        setForm({ userId: "", type: "course", referenceId: "", grade: "" });
        load();
      } else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setIssuing(false); }
  };

  return (
    <div>
      <PageHeader
        title="Certificates"
        description="Issue & track certificates for course completion or event participation."
        action={!showForm && <Button onClick={() => setShowForm(true)}><Send size={15} className="mr-1.5" /> Issue certificate</Button>}
      />

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={onIssue} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Member *</Label>
                  <Select value={form.userId} onValueChange={(v) => setForm({ ...form, userId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a member" /></SelectTrigger>
                    <SelectContent>{users.map((u) => <SelectItem key={u._id} value={u._id}>{u.fullName} ({u.email})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v, referenceId: "" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="course">Course Completion</SelectItem>
                      <SelectItem value="event">Event Participation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>{form.type === "course" ? "Course" : "Event"} *</Label>
                  <Select value={form.referenceId} onValueChange={(v) => setForm({ ...form, referenceId: v })}>
                    <SelectTrigger><SelectValue placeholder={`Pick a ${form.type}`} /></SelectTrigger>
                    <SelectContent>
                      {(form.type === "course" ? courses : events).map((x) => (
                        <SelectItem key={x._id} value={x._id}>{x.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label>Grade (optional)</Label>
                  <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="A+, Distinction, etc." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={issuing} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                  {issuing ? <LoaderCircle className="animate-spin" size={14} /> : <><Send size={14} className="mr-1.5" /> Issue</>}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>
      ) : certs.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <Award className="mx-auto text-gray-400 mb-3" size={32} />
          No certificates issued yet.
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Recipient</th>
                  <th className="text-left px-4 py-3">For</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Number</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Issued</th>
                  <th className="text-right px-4 py-3 w-24">View</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{c.recipientName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 line-clamp-1">{c.referenceTitle}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 capitalize">{c.type}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs">{c.number}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{formatDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/certificate/${c.number}`} target="_blank" className="text-indigo-500 inline-flex items-center gap-1 text-xs"><ExternalLink size={13} /> View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
