"use client";

/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  GraduationCap,
  Hash,
  LoaderCircle,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

const departments = ["Computer", "Civil", "Electrical", "Electronics", "Power", "Mechanical", "Other"];
const shifts = ["1st", "2nd"];

const benefits = [
  { icon: Code2, title: "Hands-on workshops", text: "Web, app, AI/ML and competitive programming sessions." },
  { icon: Trophy, title: "Contests & hackathons", text: "Compete, win prizes and earn certificates." },
  { icon: Users, title: "A real community", text: "Learn with peers and mentors from TPI and beyond." },
  { icon: GraduationCap, title: "Free, forever", text: "No fees — just bring your curiosity." },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizePhone = (v) => v.replace(/[\s-]/g, "").replace(/^\+?88/, "");
const PHONE_RE = /^01[3-9]\d{8}$/;

function validate(form) {
  const e = {};
  if (!form.fullName.trim()) e.fullName = "Please enter your full name";
  else if (form.fullName.trim().length < 3) e.fullName = "Name looks too short";
  if (!form.email.trim()) e.email = "Email is required";
  else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email address";
  if (!form.mobileNumber.trim()) e.mobileNumber = "Mobile number is required";
  else if (!PHONE_RE.test(normalizePhone(form.mobileNumber))) e.mobileNumber = "Use an 11-digit number like 01XXXXXXXXX";
  if (!form.rollNumber.trim()) e.rollNumber = "Roll number is required";
  else if (!/^[A-Za-z0-9-]{3,20}$/.test(form.rollNumber.trim())) e.rollNumber = "Use letters and numbers only";
  if (!form.department) e.department = "Select your department";
  if (!form.shift) e.shift = "Select your shift";
  if (form.password.length < 6) e.password = "Use at least 6 characters";
  return e;
}

const STEP_FIELDS = { 1: ["fullName", "email", "mobileNumber"], 2: ["rollNumber", "department", "shift", "password"] };

function Field({ id, label, error, valid, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center justify-between">
        <span>{label}</span>
        {valid && <Check size={14} className="text-emerald-500" aria-hidden="true" />}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={12} /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

function IconInput({ icon: Icon, invalid, valid, className, right, ...props }) {
  return (
    <div className="relative">
      <Icon size={16} className={cn("absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none", invalid ? "text-red-400" : "text-gray-400")} />
      <Input
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${props.id}-error` : undefined}
        className={cn(
          "h-11 pl-9 rounded-lg bg-white dark:bg-gray-950 transition",
          invalid && "border-red-400 focus-visible:ring-red-400 dark:border-red-500/60",
          valid && "border-emerald-400/70 dark:border-emerald-500/40",
          right && "pr-10",
          className
        )}
        {...props}
      />
      {right}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { fetchUserData } = useUser();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    rollNumber: "",
    department: "",
    shift: "",
    password: "",
  });

  const errors = useMemo(() => validate(form), [form]);
  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setServerError(null);
  };
  const touch = (k) => setTouched((t) => ({ ...t, [k]: true }));
  const show = (k) => (touched[k] ? errors[k] : undefined);
  const ok = (k) => touched[k] && !errors[k] && !!form[k];

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose an image");
    if (f.size > 4 * 1024 * 1024) return toast.error("Image must be under 4 MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const stepValid = (s) => STEP_FIELDS[s].every((k) => !errors[k]);

  const next = (e) => {
    e?.preventDefault();
    setTouched((t) => ({ ...t, ...Object.fromEntries(STEP_FIELDS[1].map((k) => [k, true])) }));
    if (stepValid(1)) setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched((t) => ({ ...t, ...Object.fromEntries(STEP_FIELDS[2].map((k) => [k, true])) }));
    if (!stepValid(1)) return setStep(1);
    if (!stepValid(2)) return;

    setLoading(true);
    setServerError(null);
    const fd = new FormData();
    Object.entries({ ...form, fullName: form.fullName.trim(), email: form.email.trim(), mobileNumber: normalizePhone(form.mobileNumber), rollNumber: form.rollNumber.trim() })
      .forEach(([k, v]) => fd.append(k, v));
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
      } else setServerError(data.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      setServerError(msg);
      if (/email/i.test(msg)) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const pwdScore =
    (form.password.length >= 6 ? 1 : 0) +
    (form.password.length >= 10 ? 1 : 0) +
    (/[A-Z]/.test(form.password) && /[a-z]/.test(form.password) ? 1 : 0) +
    (/[0-9]/.test(form.password) || /[^A-Za-z0-9]/.test(form.password) ? 1 : 0);
  const pwdLabel = ["Too short", "Weak", "Fair", "Good", "Strong"][pwdScore];
  const pwdColor = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-emerald-500"][pwdScore];

  return (
    <div className="auth-wide grid md:grid-cols-[1fr_1.15fr] overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-gray-950/80 backdrop-blur shadow-2xl shadow-indigo-500/10">
      {/* Brand panel */}
      <aside className="relative hidden md:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-10 text-white">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg">
            <img src="/tpicpc_logo.png" alt="TPI CPC" className="h-8 w-auto" />
          </div>
          <h1 className="mt-8 text-3xl lg:text-[34px] font-extrabold leading-tight tracking-tight">
            Learn, build and compete with TPI CPC.
          </h1>
          <p className="mt-3 text-white/80 leading-relaxed">
            Thakurgaon Polytechnic Institute Computer &amp; Programming Club — a community of student coders.
          </p>
          <ul className="mt-8 space-y-5">
            {benefits.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white/15 ring-1 ring-white/20 flex items-center justify-center">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="block text-sm text-white/75">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative mt-10 text-sm text-white/80">
          Already a member?{" "}
          <Link href="/login" className="font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
            Sign in
          </Link>
        </p>
      </aside>

      {/* Form */}
      <div className="p-6 sm:p-8 lg:p-10">
        <div className="md:hidden flex justify-center mb-5">
          <img src="/tpicpc_logo.png" alt="TPI CPC" className="h-10 w-auto" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">Create your account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Free for every student. Takes less than a minute.</p>

        {/* Stepper */}
        <ol className="mt-6 grid grid-cols-2 gap-3" aria-label="Signup progress">
          {[
            [1, "About you"],
            [2, "Academic & security"],
          ].map(([n, label]) => {
            const done = step > n;
            const current = step === n;
            return (
              <li key={n} aria-current={current ? "step" : undefined}>
                <div className={cn("h-1.5 rounded-full transition-colors", step >= n ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-gray-200 dark:bg-white/10")} />
                <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", current ? "text-indigo-600 dark:text-indigo-300" : done ? "text-gray-700 dark:text-gray-300" : "text-gray-400")}>
                  {done ? <CheckCircle2 size={13} className="text-emerald-500" /> : <span className="tabular-nums">{n}.</span>}
                  {label}
                </p>
              </li>
            );
          })}
        </ol>

        {serverError && (
          <div role="alert" className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              {serverError}
              {/already registered/i.test(serverError) && (
                <> — <Link href="/login" className="font-semibold underline">sign in instead</Link></>
              )}
            </span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={next} noValidate className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="profile" className="relative cursor-pointer shrink-0 group" aria-label="Upload profile picture">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 ring-indigo-500/30 flex items-center justify-center">
                  {preview ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover" /> : <User size={24} className="text-gray-400" />}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-950 group-hover:bg-indigo-600 transition">
                  <Camera size={12} />
                </span>
                <input id="profile" type="file" accept="image/*" onChange={onFile} className="sr-only" />
              </label>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-white">Profile photo</p>
                <p className="text-xs text-gray-500">Optional · JPG or PNG, up to 4 MB</p>
              </div>
            </div>

            <Field id="fullName" label="Full name" error={show("fullName")} valid={ok("fullName")}>
              <IconInput id="fullName" icon={User} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} onBlur={() => touch("fullName")} invalid={!!show("fullName")} valid={ok("fullName")} placeholder="e.g. Md Rohanul Haque" autoComplete="name" />
            </Field>

            <Field id="email" label="Email" error={show("email")} valid={ok("email")} hint="We'll send a 4-digit code to verify this email.">
              <IconInput id="email" type="email" icon={Mail} value={form.email} onChange={(e) => update("email", e.target.value)} onBlur={() => touch("email")} invalid={!!show("email")} valid={ok("email")} placeholder="you@gmail.com" autoComplete="email" inputMode="email" />
            </Field>

            <Field id="mobileNumber" label="Mobile number" error={show("mobileNumber")} valid={ok("mobileNumber")}>
              <IconInput id="mobileNumber" type="tel" icon={Phone} value={form.mobileNumber} onChange={(e) => update("mobileNumber", e.target.value)} onBlur={() => touch("mobileNumber")} invalid={!!show("mobileNumber")} valid={ok("mobileNumber")} placeholder="01XXXXXXXXX" autoComplete="tel" inputMode="tel" />
            </Field>

            <Button type="submit" className="w-full h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-semibold shadow-md shadow-indigo-500/20">
              Continue <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <Field id="rollNumber" label="Board roll number" error={show("rollNumber")} valid={ok("rollNumber")}>
              <IconInput id="rollNumber" icon={Hash} value={form.rollNumber} onChange={(e) => update("rollNumber", e.target.value)} onBlur={() => touch("rollNumber")} invalid={!!show("rollNumber")} valid={ok("rollNumber")} placeholder="e.g. 123456" inputMode="numeric" />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field id="department" label="Department" error={show("department")} valid={!!form.department}>
                <Select value={form.department} onValueChange={(v) => { update("department", v); touch("department"); }}>
                  <SelectTrigger id="department" aria-invalid={!!show("department") || undefined} className={cn("h-11 rounded-lg bg-white dark:bg-gray-950", show("department") && "border-red-400")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field id="shift" label="Shift" error={show("shift")} valid={!!form.shift}>
                <Select value={form.shift} onValueChange={(v) => { update("shift", v); touch("shift"); }}>
                  <SelectTrigger id="shift" aria-invalid={!!show("shift") || undefined} className={cn("h-11 rounded-lg bg-white dark:bg-gray-950", show("shift") && "border-red-400")}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>{shifts.map((s) => <SelectItem key={s} value={s}>{s} shift</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            <Field id="password" label="Password" error={show("password")} valid={ok("password")}>
              <IconInput
                id="password"
                icon={Lock}
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                onBlur={() => touch("password")}
                invalid={!!show("password")}
                valid={ok("password")}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPwd ? "Hide password" : "Show password"}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {form.password && (
                <div className="flex items-center gap-2 pt-1" aria-live="polite">
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={cn("h-1.5 rounded-full transition-colors", pwdScore >= i ? pwdColor : "bg-gray-200 dark:bg-white/10")} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{pwdLabel}</span>
                </div>
              )}
            </Field>

            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-3 py-2.5 flex items-start gap-2.5">
              <ShieldCheck className="text-indigo-500 mt-0.5 shrink-0" size={16} />
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-snug">
                After signup we&apos;ll email you a 4-digit code. Verifying unlocks workshop enrollment, blogging and comments.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-11 rounded-lg">
                <ArrowLeft size={16} className="mr-1.5" /> Back
              </Button>
              <Button type="submit" className="flex-1 h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 text-white font-semibold shadow-md shadow-indigo-500/20" disabled={loading}>
                {loading ? <><LoaderCircle className="animate-spin mr-2" size={18} /> Creating account…</> : "Create account"}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground md:hidden">
          Already have an account? <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Sign in</Link>
        </p>
        <p className="mt-6 text-center text-xs text-gray-400">
          By creating an account you agree to follow the TPI CPC code of conduct.
        </p>
      </div>
    </div>
  );
}
