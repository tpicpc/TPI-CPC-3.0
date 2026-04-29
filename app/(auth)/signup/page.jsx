"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle, Mail, Phone, ShieldCheck, Sparkles, Upload, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const departments = ["Computer", "Civil", "Electrical", "Electronics", "Power", "Mechanical", "Other"];
const shifts = ["1st", "2nd"];

export default function SignupPage() {
  const router = useRouter();
  const { fetchUserData } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    rollNumber: "",
    department: "",
    shift: "",
    password: "",
  });

  const update = (k, v) => setForm({ ...form, [k]: v });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const validateStep1 = () => {
    if (!form.fullName.trim()) return setError("Full name is required") || false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email") || false;
    if (!form.mobileNumber.trim()) return setError("Mobile number is required") || false;
    return true;
  };

  const next = () => {
    setError(null);
    if (validateStep1()) setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.rollNumber.trim()) return setError("Roll number is required");
    if (!form.department) return setError("Select your department");
    if (!form.shift) return setError("Select your shift");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("profileImage", file);

    try {
      const { data } = await axios.post("/api/v1/user/signup", fd);
      if (data.success) {
        localStorage.setItem("token", data.token);
        await fetchUserData();
        if (data.requiresVerification) {
          toast.success("Account created — let's verify your email");
          router.push("/verify-email");
        } else {
          toast.success("Welcome to TPI CPC!");
          router.push("/profile");
        }
      } else setError(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? "" :
    form.password.length < 6 ? "weak" :
    form.password.length < 10 ? "medium" : "strong";

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <div className="bg-gradient-to-br from-indigo-500 to-violet-500 px-6 py-8 text-white text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
          <Sparkles size={22} />
        </div>
        <h2 className="text-2xl font-extrabold">Join TPI CPC</h2>
        <p className="text-sm text-white/80 mt-1">
          Create your free account · Step {step} of 2
        </p>
        <div className="flex gap-2 mt-4 max-w-xs mx-auto">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-white" : "bg-white/30"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-white" : "bg-white/30"}`} />
        </div>
      </div>

      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">About you</p>

            <div className="flex items-center gap-4">
              <label htmlFor="profile" className="cursor-pointer shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-dashed">
                  {preview ? <img src={preview} alt="preview" className="w-full h-full object-cover" /> : <Upload size={20} className="text-gray-400" />}
                </div>
              </label>
              <div className="flex-1">
                <Label htmlFor="profile">Profile picture</Label>
                <Input id="profile" type="file" accept="image/*" onChange={onFile} className="mt-1.5" />
                <p className="text-xs text-gray-500 mt-1">Optional, up to 4 MB</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name *</Label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input id="fullName" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="MD Rohanul Haque" className="pl-9" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@gmail.com" className="pl-9" autoComplete="email" />
              </div>
              <p className="text-[11px] text-gray-500">We'll send a 4-digit verification code to this email.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile *</Label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input id="mobile" required value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} placeholder="01XXXXXXXXX" className="pl-9" autoComplete="tel" />
              </div>
            </div>

            <Button type="button" onClick={next} className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white">
              Continue <ArrowRight size={16} className="ml-2" />
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="text-indigo-500 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Academic & security</p>

            <div className="space-y-1.5">
              <Label>Roll number *</Label>
              <Input required value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} placeholder="123456" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select value={form.department} onValueChange={(v) => update("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Shift *</Label>
                <Select value={form.shift} onValueChange={(v) => update("shift", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{shifts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pwd">Password *</Label>
              <div className="relative">
                <Input id="pwd" type={showPwd ? "text" : "password"} required value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 6 characters" className="pr-10" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {strength && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className={`h-full transition-all ${strength === "weak" ? "w-1/3 bg-red-500" : strength === "medium" ? "w-2/3 bg-yellow-500" : "w-full bg-green-500"}`} />
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">{strength}</span>
                </div>
              )}
              <ul className="text-[11px] text-gray-500 space-y-0.5 mt-1.5">
                <li className={form.password.length >= 6 ? "text-green-600" : ""}>
                  <CheckCircle2 size={11} className="inline mr-1" /> 6+ characters
                </li>
                <li className={/[A-Z]/.test(form.password) ? "text-green-600" : ""}>
                  <CheckCircle2 size={11} className="inline mr-1" /> One uppercase letter (recommended)
                </li>
                <li className={/[0-9]/.test(form.password) ? "text-green-600" : ""}>
                  <CheckCircle2 size={11} className="inline mr-1" /> One number (recommended)
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-2.5 flex items-start gap-2.5">
              <ShieldCheck className="text-indigo-500 mt-0.5 shrink-0" size={16} />
              <p className="text-[12px] text-indigo-700 dark:text-indigo-300 leading-snug">
                After signup, we'll email a 4-digit code to verify your address. Verification unlocks course enrollment.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11">
                <ArrowLeft size={16} className="mr-2" /> Back
              </Button>
              <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white" disabled={loading}>
                {loading ? <LoaderCircle className="animate-spin" size={18} /> : "Create account"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
