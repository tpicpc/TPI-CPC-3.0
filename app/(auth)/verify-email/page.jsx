"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";
import { LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { userData, fetchUserData, loading: userLoading } = useUser();

  const [digits, setDigits] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);
  const redirectTo = params.get("redirect") || "/profile";

  useEffect(() => {
    if (!userLoading && !userData) router.push("/login");
    if (userData?.emailVerified) router.push(redirectTo);
  }, [userData, userLoading, router, redirectTo]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const setDigitAt = (i, v) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 3) inputs.current[i + 1]?.focus();
  };

  const onPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    const next = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const onVerify = async (otpStr) => {
    setVerifying(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "/api/v1/user/verify-email",
        { otp: otpStr },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Email verified — you're all set");
        await fetchUserData();
        router.push(redirectTo);
      } else {
        toast.error(data.message);
        setDigits(["", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  // Auto-submit when 4 digits filled
  useEffect(() => {
    const otp = digits.join("");
    if (otp.length === 4 && !verifying) onVerify(otp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  const onResend = async () => {
    setResending(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        "/api/v1/user/resend-verify-otp",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("New code sent to your email");
        setCooldown(60);
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setResending(false);
    }
  };

  if (userLoading || !userData) {
    return <div className="min-h-[40vh] flex items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-3">
          <Mail size={26} className="text-white" />
        </div>
        <CardTitle>Verify your email</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          We sent a 4-digit code to <strong className="text-gray-900 dark:text-white">{userData.email}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="flex items-center justify-center gap-3" onPaste={onPaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setDigitAt(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                disabled={verifying}
                className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition disabled:opacity-50"
              />
            ))}
          </div>

          {verifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-indigo-500">
              <LoaderCircle className="animate-spin" size={16} /> Verifying...
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Didn't get the code?{" "}
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button onClick={onResend} disabled={resending} className="text-indigo-500 hover:underline font-medium disabled:opacity-50">
                {resending ? "Sending..." : "Resend code"}
              </button>
            )}
          </div>

          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-3 flex items-start gap-3">
            <ShieldCheck className="text-indigo-500 mt-0.5 shrink-0" size={18} />
            <div className="text-xs text-indigo-700 dark:text-indigo-300">
              Verifying your email unlocks course enrollment and protects your account from misuse.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
