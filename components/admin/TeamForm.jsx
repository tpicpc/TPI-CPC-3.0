"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { getDefaultAvatar } from "@/lib/avatars";
import { ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const POSITIONS = [
  "President",
  "Vice President",
  "Associate Vice President",
  "General Secretary",
  "Assistant General Secretary",
  "Treasurer",
  "Co-Treasurer",
  "Press Secretary",
  "Assistant Press Secretary",
  "Media Secretary",
  "Digital Content Creator",
  "Lead Creative Designer",
  "Creative Designer",
  "Event Manager",
  "Executive Member",
  "Member",
];

const DEPARTMENTS = ["Computer", "Civil", "Electrical", "Electronics", "Power", "Mechanical", "Other"];
const SHIFTS = ["1st", "2nd"];

const EMPTY = {
  name: "",
  position: "",
  gender: "",
  year: new Date().getFullYear(),
  bio: "",
  email: "",
  mobileNumber: "",
  rollNumber: "",
  department: "",
  shift: "",
  session: "",
  facebook: "",
  linkedin: "",
  github: "",
  order: 0,
};

export default function TeamForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [positionMode, setPositionMode] = useState("preset");
  const [yearMode, setYearMode] = useState("preset");
  const [showAcademic, setShowAcademic] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const yearOptions = useMemo(() => {
    const now = new Date().getFullYear();
    const list = [];
    for (let y = now + 1; y >= now - 8; y--) list.push(y);
    return list;
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get(`/api/v1/team`).then(({ data }) => {
      if (data.success) {
        const m = data.teams.find((t) => t._id === id);
        if (m) {
          setForm({ ...EMPTY, ...m, year: m.year, order: m.order || 0 });
          setPositionMode(POSITIONS.includes(m.position) ? "preset" : "custom");
          setYearMode(yearOptions.includes(m.year) ? "preset" : "custom");
          setPreview(m.memberProfile);
          setShowAcademic(!!(m.email || m.mobileNumber || m.rollNumber || m.department || m.shift || m.session));
          setShowSocials(!!(m.facebook || m.linkedin || m.github));
        }
      }
    }).finally(() => setLoading(false));
  }, [id, isEdit, yearOptions]);

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
    if (!form.year) return toast.error("Year is required");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      // Don't send the existing image URL as a form field — it would shadow
      // the new File when the API reads `formData.get("memberProfile")`.
      if (k === "memberProfile") return;
      fd.append(k, v ?? "");
    });
    if (file) fd.append("memberProfile", file);
    try {
      const url = isEdit ? `/api/v1/team/${id}` : `/api/v1/team`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) {
        toast.success(isEdit ? "Updated" : "Created");
        router.push("/admin/teams");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>;

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-violet-500 to-blue-500 shrink-0">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 ring-2 ring-white dark:ring-gray-950 flex items-center justify-center">
                <img src={preview || getDefaultAvatar(form.gender)} alt="preview" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label>Profile picture (optional)</Label>
              <Input type="file" accept="image/*" onChange={onFile} />
              <p className="text-xs text-muted-foreground">
                Leave empty to use the default {form.gender || "neutral"} avatar.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Basic info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full name *</Label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MD Rohanul Haque" />
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
                    <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input required value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Enter custom position" />
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Year *</Label>
                  <button
                    type="button"
                    onClick={() => setYearMode(yearMode === "preset" ? "custom" : "preset")}
                    className="text-xs text-indigo-500 hover:underline"
                  >
                    {yearMode === "preset" ? "Use custom..." : "Use preset"}
                  </button>
                </div>
                {yearMode === "preset" ? (
                  <Select
                    value={String(form.year || "")}
                    onValueChange={(v) => setForm({ ...form, year: Number(v) })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>{yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} placeholder="2025" />
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Display order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} placeholder="0" />
                <p className="text-[11px] text-muted-foreground">Lower number appears first within the same position.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowAcademic(!showAcademic)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contact & academic info</h3>
                <p className="text-xs text-muted-foreground">All optional — used internally for record keeping</p>
              </div>
              {showAcademic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showAcademic && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-4">
                <div className="space-y-1.5">
                  <Label>Gmail / Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="member@gmail.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Mobile number</Label>
                  <Input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} placeholder="01XXXXXXXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label>Roll number</Label>
                  <Input value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="123456" />
                </div>
                <div className="space-y-1.5">
                  <Label>Session</Label>
                  <Input value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} placeholder="2022-23" />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Select
                    value={form.department || "_none"}
                    onValueChange={(v) => setForm({ ...form, department: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Not specified</SelectItem>
                      {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Shift</Label>
                  <Select
                    value={form.shift || "_none"}
                    onValueChange={(v) => setForm({ ...form, shift: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">Not specified</SelectItem>
                      {SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-gray-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setShowSocials(!showSocials)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Social profiles</h3>
                <p className="text-xs text-muted-foreground">Shown as hover icons on the public team page</p>
              </div>
              {showSocials ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {showSocials && (
              <div className="grid grid-cols-1 gap-3 px-4 pb-4">
                <div className="space-y-1.5">
                  <Label>Facebook URL</Label>
                  <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} placeholder="https://facebook.com/..." />
                </div>
                <div className="space-y-1.5">
                  <Label>LinkedIn URL</Label>
                  <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="space-y-1.5">
                  <Label>GitHub URL</Label>
                  <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Bio (optional)</Label>
            <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Short bio" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : (isEdit ? "Save changes" : "Add member")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/teams")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
