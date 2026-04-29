"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import NoticeBar from "@/components/NoticeBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { userData, loading, fetchUserData } = useUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!loading && !userData) router.push("/login");
    if (userData) setForm(userData);
  }, [userData, loading, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    const fd = new FormData();
    for (const k of ["fullName", "mobileNumber", "rollNumber", "department", "shift"]) {
      if (form[k]) fd.append(k, form[k]);
    }
    if (file) fd.append("profileImage", file);
    try {
      const { data } = await axios.put("/api/v1/user/update", fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success("Profile updated");
        await fetchUserData();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <NoticeBar />
      <Navbar />
      <main className="container mx-auto px-4 md:px-10 py-12 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {userData.profileImage ? (
                <img src={userData.profileImage} alt={userData.fullName} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold">
                  {userData.fullName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <CardTitle>{userData.fullName}</CardTitle>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Profile picture</Label>
                <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Full name</Label>
                <Input value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={form.mobileNumber || ""} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Roll number</Label>
                <Input value={form.rollNumber || ""} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Shift</Label>
                <Input value={form.shift || ""} onChange={(e) => setForm({ ...form, shift: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <LoaderCircle className="animate-spin" size={18} /> : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
