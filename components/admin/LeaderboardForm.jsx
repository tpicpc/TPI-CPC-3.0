"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function LeaderboardForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    name: "", department: "", rollNumber: "", handle: "", badge: "",
    points: 0, contributions: 0, contestsWon: 0, year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get(`/api/v1/leaderboard/list?year=`).then(({ data }) => {
      if (!data.success) return;
      const e = data.entries.find((x) => x._id === id);
      if (!e) {
        adminApi().get(`/api/v1/leaderboard/list?year=${new Date().getFullYear()}`).then(({ data: d }) => {
          const m = d.entries?.find((x) => x._id === id);
          if (m) populate(m);
        });
        return;
      }
      populate(e);
    }).finally(() => setLoading(false));

    function populate(e) {
      setForm({
        name: e.name, department: e.department || "", rollNumber: e.rollNumber || "",
        handle: e.handle || "", badge: e.badge || "",
        points: e.points || 0, contributions: e.contributions || 0, contestsWon: e.contestsWon || 0,
        year: e.year,
      });
      setPreview(e.profileImage);
    }
  }, [id, isEdit]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    if (file) fd.append("profileImage", file);
    try {
      const url = isEdit ? `/api/v1/leaderboard/${id}` : `/api/v1/leaderboard`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) { toast.success(isEdit ? "Updated" : "Added"); router.push("/admin/leaderboard"); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>;

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden border flex items-center justify-center shrink-0">
              {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">No image</span>}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Profile picture (optional)</Label>
              <Input type="file" accept="image/*" onChange={onFile} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2"><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Department</Label><Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Roll number</Label><Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Handle (e.g. CodeForces)</Label><Input value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Badge</Label><Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Gold / Champion" /></div>
            <div className="space-y-1.5"><Label>Points *</Label><Input type="number" required value={form.points} onChange={(e) => setForm({ ...form, points: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Contributions</Label><Input type="number" value={form.contributions} onChange={(e) => setForm({ ...form, contributions: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Contests won</Label><Input type="number" value={form.contestsWon} onChange={(e) => setForm({ ...form, contestsWon: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Year *</Label><Input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : isEdit ? "Save changes" : "Add to leaderboard"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/leaderboard")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
