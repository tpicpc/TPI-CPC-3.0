"use client";

import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AskQuestionPage() {
  const router = useRouter();
  const { userData, loading } = useUser();
  const [form, setForm] = useState({ title: "", body: "", tags: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !userData) router.push("/login?redirect=/forum/ask");
    if (userData && userData.emailVerified === false) router.push("/verify-email?redirect=/forum/ask");
  }, [userData, loading, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.title.trim().length < 10) return toast.error("Title must be at least 10 characters");
    if (form.body.trim().length < 20) return toast.error("Body must be at least 20 characters");
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data } = await axios.post("/api/v1/questions", { ...form, tags }, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { toast.success("Question posted"); router.push(`/forum/${data.question._id}`); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  if (loading || !userData) return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 md:px-10 py-12 max-w-3xl">
      <SectionTitle title="Ask a Question" subtitle="Be specific. Include code samples, what you tried, and what error you got." />
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. How do I fix a TypeError in React useEffect?" />
              <p className="text-xs text-gray-500">{form.title.length} / 10 minimum</p>
            </div>
            <div className="space-y-1.5">
              <Label>Body *</Label>
              <Textarea required rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Describe your problem in detail. Include code if relevant — use ``` for code blocks." />
              <p className="text-xs text-gray-500">{form.body.length} / 20 minimum</p>
            </div>
            <div className="space-y-1.5">
              <Label>Tags (comma-separated, up to 5)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript, hooks" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
                {saving ? <LoaderCircle className="animate-spin" size={16} /> : <><Send size={14} className="mr-1.5" /> Post Question</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
