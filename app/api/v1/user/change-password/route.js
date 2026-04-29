import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { passwordStrength } from "@/lib/validators";
import User from "@/models/User";

export async function PUT(req) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) return fail("All fields required", 400);

    const pwd = passwordStrength(newPassword);
    if (!pwd.ok) return fail(pwd.message, 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail("User not found", 404);
    if (!user.otp || user.otp !== Number(otp)) return fail("Invalid OTP", 400);
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) return fail("OTP expired", 400);

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    return ok({}, "Password changed");
  } catch (e) {
    return serverError(e);
  }
}
