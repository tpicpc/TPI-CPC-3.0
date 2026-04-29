"use client";

import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle, MessageSquarePlus, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const DEPARTMENTS = ["Computer", "Civil", "Electrical", "Electronics", "Power", "Mechanical", "Other"];
const SHIFTS = ["1st", "2nd"];
const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

export default function AddReviewPage() {
  const router = useRouter();
  const { userData, loading } = useUser();
  const [form, setForm] = useState({ fullName: "", semester: "", shift: "", reviewMessage: "", department: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/add-review");
    if (userData) {
      setForm((f) => ({
        ...f,
        fullName: userData.fullName || "",
        shift: userData.shift || "",
        department: userData.department || "",
      }));
      setPreview(userData.profileImage || null);
    }
  }, [userData, loading, router]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.reviewMessage.trim().length < 15) return toast.error("Please write at least 15 characters");
    setSaving(true);
    const token = localStorage.getItem("token");
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("profileImage", file);
    else if (userData?.profileImage) fd.append("profileImage", userData.profileImage);
    try {
      const { data } = await axios.post("/api/v1/review", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Thanks for your review!");
        router.push("/testimonials");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 md:px-10 py-16 max-w-2xl">
      <SectionTitle
        title="Share Your Experience"
        subtitle="Tell others what TPI CPC means to you. Your review will appear on the Testimonials page."
      />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed shrink-0">
                {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-400" />}
              </div>
              <div className="flex-1">
                <Label>Profile picture (optional)</Label>
                <Input type="file" accept="image/*" onChange={onFile} className="mt-1.5" />
                <p className="text-xs text-gray-500 mt-1">If empty, your account picture will be used.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select value={form.department || ""} onValueChange={(v) => setForm({ ...form, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Semester *</Label>
                <Select value={form.semester || ""} onValueChange={(v) => setForm({ ...form, semester: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Shift *</Label>
                <Select value={form.shift || ""} onValueChange={(v) => setForm({ ...form, shift: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SHIFTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Your review *</Label>
              <Textarea
                required
                rows={6}
                value={form.reviewMessage}
                onChange={(e) => setForm({ ...form, reviewMessage: e.target.value })}
                placeholder="What did you learn? What are your favorite memories? How has TPI CPC helped you grow?"
              />
              <p className="text-xs text-gray-500">{form.reviewMessage.length} / 15 minimum characters</p>
            </div>

            <Button type="submit" disabled={saving} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : (<><MessageSquarePlus size={16} className="mr-2" /> Submit Review</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
