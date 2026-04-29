"use client";

import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";
import { adminApi } from "@/lib/api-client";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AdminProfilePage() {
  const { admin, fetchAdmin } = useAdmin();
  const [form, setForm] = useState({ name: "", password: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (admin) setForm((f) => ({ ...f, name: admin.name }));
  }, [admin]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    if (form.name) fd.append("name", form.name);
    if (form.password) fd.append("password", form.password);
    if (file) fd.append("adminProfile", file);
    try {
      const { data } = await adminApi().put("/api/v1/admin/update-profile", fd);
      if (data.success) {
        toast.success("Profile updated");
        setForm({ ...form, password: "" });
        await fetchAdmin();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="My Profile" description="Update your admin info" />
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              {admin?.adminProfile ? (
                <img src={admin.adminProfile} alt={admin.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  {admin?.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <Label>Profile picture</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>New password (leave blank to keep current)</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={admin?.email || ""} disabled />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" size={18} /> : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
