"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", otp: "", newPassword: "" });

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post("/api/v1/user/send-reset-otp", { email: form.email });
      if (data.success) { toast.success("OTP sent — check your email"); setStep(2); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  const verifyAndChange = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6) return toast.error("Password must be 6+ chars");
    setLoading(true);
    try {
      const { data } = await axios.put("/api/v1/user/change-password", form);
      if (data.success) { toast.success("Password changed — sign in"); router.push("/login"); }
      else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <p className="text-sm text-muted-foreground">{step === 1 ? "Enter your email to get an OTP" : "Enter the OTP and your new password"}</p>
      </CardHeader>
      <CardContent>
        {step === 1 ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="space-y-2"><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" size={18} /> : "Send OTP"}</Button>
          </form>
        ) : (
          <form onSubmit={verifyAndChange} className="space-y-4">
            <div className="space-y-2"><Label>OTP</Label><Input required maxLength={6} value={form.otp} onChange={(e) => setForm({ ...form, otp: e.target.value })} placeholder="6 digit code" className="font-mono tracking-widest" /></div>
            <div className="space-y-2"><Label>New password</Label><Input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? <LoaderCircle className="animate-spin" size={18} /> : "Change password"}</Button>
            <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setStep(1)}>← Back</button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
