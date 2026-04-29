"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { adminApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const eventTypes = ["Workshop", "Contest", "Webinar", "Bootcamp", "Hackathon", "Seminar", "Festival", "Other"];
const statuses = ["Upcoming", "Ongoing", "Completed"];

export default function EventForm({ id }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    title: "", location: "", description: "", eventType: "", organizer: "TPI CPC",
    collaboration: "", startTime: "", endTime: "", status: "Upcoming",
  });

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    adminApi().get("/api/v1/event/list").then(({ data }) => {
      if (data.success) {
        const e = data.events.find((x) => x._id === id);
        if (e) {
          setForm({
            title: e.title, location: e.location, description: e.description, eventType: e.eventType,
            organizer: e.organizer, collaboration: e.collaboration || "",
            startTime: e.startTime, endTime: e.endTime || "", status: e.status,
          });
          setPreview(e.eventImage);
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
    if (!isEdit && !file) return toast.error("Please upload an event image");
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("eventImage", file);
    try {
      const url = isEdit ? `/api/v1/event/${id}` : `/api/v1/event`;
      const method = isEdit ? "put" : "post";
      const { data } = await adminApi()[method](url, fd);
      if (data.success) { toast.success(isEdit ? "Updated" : "Created"); router.push("/admin/events"); }
      else toast.error(data.message);
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><LoaderCircle className="animate-spin" /></div>;

  return (
    <Card className="max-w-3xl">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cover image {isEdit ? "(optional)" : "*"}</Label>
            {preview && <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded-md border" />}
            <Input type="file" accept="image/*" onChange={onFile} />
          </div>
          <div className="space-y-1.5"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Location *</Label><Input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Organizer *</Label><Input required value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} /></div>
            <div className="space-y-1.5">
              <Label>Event type *</Label>
              <Select value={form.eventType} onValueChange={(v) => setForm({ ...form, eventType: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{eventTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Start time *</Label><Input type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>End time</Label><Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></div>
            <div className="space-y-1.5 md:col-span-2"><Label>Collaboration / partner</Label><Input value={form.collaboration} onChange={(e) => setForm({ ...form, collaboration: e.target.value })} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Textarea rows={5} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? <LoaderCircle className="animate-spin" size={18} /> : isEdit ? "Save changes" : "Create event"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/events")}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
