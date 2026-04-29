"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { ArrowLeft, KeyRound, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/admin/send-reset-otp", { email: form.email });
      if (data.success) { toast.success("OTP sent"); setStep(2); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const change = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return toast.error("Password must be 6+ chars");
    setLoading(true);
    try {
      const { data } = await axios.put("/api/v1/admin/change-password", form);
      if (data.success) {
        toast.success("Password changed — sign in with the new one");
        router.push("/admin/login");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500 flex items-center justify-center mb-3">
            <KeyRound className="text-white" size={22} />
          </div>
          <CardTitle>Reset admin password</CardTitle>
          <p className="text-sm text-muted-foreground">{step === 1 ? "We'll email a one-time code" : "Enter the code and your new password"}</p>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={sendOtp} className="space-y-4">
              <div className="space-y-2"><Label>Admin email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin" size={18} /> : "Send OTP"}
              </Button>
              <Link href="/admin/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={14} /> Back to login
              </Link>
            </form>
          ) : (
            <form onSubmit={change} className="space-y-4">
              <div className="space-y-2"><Label>OTP</Label><Input required maxLength={6} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} className="font-mono tracking-widest" placeholder="000000" /></div>
              <div className="space-y-2"><Label>New password</Label><Input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin" size={18} /> : "Change password"}
              </Button>
              <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setStep(1)}>
                Use a different email
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
