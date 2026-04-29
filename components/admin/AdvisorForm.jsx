"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ADVISOR_POSITIONS = [
  "Senior Advisor",
  "Junior Advisor",
  "Co-Advisor",
  "Chief Advisor",
  "Honorary Advisor",
  "Advisor",
];

export default function AdvisorForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [positionMode, setPositionMode] = useState("preset");
  const [form, setForm] = useState({ name: "", position: "", gender: "", order: 0 });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get("/api/v1/advisor").then(({ data }) => {
      if (data.success) {
        const a = data.advisors.find((x) => x._id === id);
        if (a) {
          setForm({ name: a.name, position: a.position, gender: a.gender || "", order: a.order || 0 });
          setPositionMode(ADVISOR_POSITIONS.includes(a.position) ? "preset" : "custom");
          setPreview(a.advisorProfile);
        }
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.position.trim()) return toast.error("Position is required");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("advisorProfile", file);
    try {
      const url = isEdit ? `/api/v1/advisor/${id}` : `/api/v1/advisor`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) { toast.success(isEdit ? "Updated" : "Created"); router.push("/admin/advisors"); }
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
            <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border flex items-center justify-center shrink-0">
              <img src={preview || getDefaultAvatar(form.gender)} alt="preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Photo (optional)</Label>
              <Input type="file" accept="image/*" onChange={onFile} />
              <p className="text-xs text-muted-foreground">Leave empty to use the default {form.gender || "neutral"} avatar.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <Label>Full name *</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MD Sahinur Islam" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Position *</Label>
                <button
                  type="button"
                  onClick={() => setPositionMode(positionMode === "preset" ? "custom" : "preset")}
                  className="text-xs text-indigo-500 hover:underline"
                >
                  {positionMode === "preset" ? "Use custom..." : "Use preset"}
                </button>
              </div>
              {positionMode === "preset" ? (
                <Select value={form.position || ""} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    {ADVISOR_POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Enter custom role" />
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={form.gender || "_none"}
                onValueChange={(v) => setForm({ ...form, gender: v === "_none" ? "" : v })}
              >
                <SelectTrigger><SelectValue placeholder="Not specified" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Not specified</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <Label>Display order</Label>
              <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              <p className="text-[11px] text-muted-foreground">Lower number appears first.</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : isEdit ? "Save changes" : "Add advisor"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/advisors")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
