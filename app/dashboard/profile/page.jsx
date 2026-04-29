"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { AtSign, Check, ExternalLink, LoaderCircle, Upload, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardProfilePage() {
  const { userData, fetchUserData } = useUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [usernameDirty, setUsernameDirty] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (userData) {
      setForm({
        fullName: userData.fullName || "",
        username: userData.username || "",
        mobileNumber: userData.mobileNumber || "",
        rollNumber: userData.rollNumber || "",
        department: userData.department || "",
        shift: userData.shift || "",
      });
      setPreview(userData.profileImage || null);
      setUsernameDirty(false);
      setUsernameStatus({ checking: false, available: null, message: "" });
    }
  }, [userData]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUsername = (v) => {
    const clean = (v || "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
    setForm({ ...form, username: clean });
    setUsernameDirty(true);
  };

  const usernameError = (() => {
    if (!form.username) return null;
    if (form.username.length < 3) return "At least 3 characters";
    if (!/^[a-z0-9_]{3,24}$/.test(form.username)) return "Use lowercase letters, numbers, underscores";
    return null;
  })();

  // Debounced live availability check
  useEffect(() => {
    if (!usernameDirty) return;
    if (!form.username || usernameError) {
      setUsernameStatus({ checking: false, available: null, message: "" });
      return;
    }
    if (form.username === userData?.username) {
      setUsernameStatus({ checking: false, available: true, message: "Your current username" });
      return;
    }
    setUsernameStatus({ checking: true, available: null, message: "" });
    const t = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const { data } = await axios.get(
          `/api/v1/user/check-username?username=${encodeURIComponent(form.username)}`,
          { headers }
        );
        if (data.success) {
          setUsernameStatus({
            checking: false,
            available: data.available,
            message: data.available ? "Available" : "Already taken",
          });
        } else {
          setUsernameStatus({ checking: false, available: false, message: data.reason || "Not allowed" });
        }
      } catch {
        setUsernameStatus({ checking: false, available: null, message: "" });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [form.username, usernameDirty, usernameError, userData?.username]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.username && usernameError) return toast.error(usernameError);
    if (usernameDirty && form.username && usernameStatus.available === false) {
      return toast.error("Username is already taken");
    }
    setSaving(true);
    const token = localStorage.getItem("token");
    const fd = new FormData();
    for (const k of ["fullName", "mobileNumber", "rollNumber", "department", "shift"]) {
      if (form[k]) fd.append(k, form[k]);
    }
    if (usernameDirty && form.username) fd.append("username", form.username);
    if (file) fd.append("profileImage", file);
    try {
      const { data } = await axios.put("/api/v1/user/update", fd, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success("Profile updated");
        await fetchUserData();
        setUsernameDirty(false);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const submitDisabled =
    saving ||
    (form.username && usernameError) ||
    usernameStatus.checking ||
    (usernameDirty && form.username && usernameStatus.available === false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white">My Profile</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed shrink-0">
                {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-400" />}
              </div>
              <div className="flex-1">
                <Label>Profile picture</Label>
                <Input type="file" accept="image/*" onChange={onFile} className="mt-1" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  id="username"
                  value={form.username || ""}
                  onChange={(e) => handleUsername(e.target.value)}
                  placeholder="your_username"
                  className="pl-9 pr-10 font-mono"
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus.checking ? (
                    <LoaderCircle size={16} className="animate-spin text-gray-400" />
                  ) : usernameStatus.available === true ? (
                    <Check size={16} className="text-green-500" />
                  ) : usernameStatus.available === false ? (
                    <X size={16} className="text-red-500" />
                  ) : null}
                </div>
              </div>

              {usernameError ? (
                <p className="text-xs text-red-600">{usernameError}</p>
              ) : usernameStatus.checking ? (
                <p className="text-xs text-gray-500">Checking availability...</p>
              ) : usernameStatus.message ? (
                <p className={`text-xs ${
                  usernameStatus.available === true ? "text-green-600" :
                  usernameStatus.available === false ? "text-red-600" : "text-gray-500"
                }`}>
                  {usernameStatus.available ? "✓ " : "✗ "}{usernameStatus.message}
                </p>
              ) : (
                <p className="text-xs text-gray-500">3–24 characters, lowercase letters, numbers, underscores. Used in your profile URL.</p>
              )}

              {form.username && !usernameError && (
                <Link href={`/members/${form.username}`} target="_blank" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 w-fit">
                  <ExternalLink size={11} /> /members/{form.username}
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label>Full name</Label>
                <Input value={form.fullName || ""} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={userData?.email || ""} disabled />
                <p className="text-[11px] text-gray-500">Email can't be changed.</p>
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
            </div>

            <Button
              type="submit"
              disabled={submitDisabled}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
            >
              {saving ? <LoaderCircle className="animate-spin" size={16} /> : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
