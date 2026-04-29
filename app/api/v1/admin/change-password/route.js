import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { passwordStrength } from "@/lib/validators";
import Admin from "@/models/Admin";

export async function PUT(req) {
  try {
    await connectDB();
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword) return fail("All fields required", 400);
    const pwd = passwordStrength(newPassword);
    if (!pwd.ok) return fail(pwd.message, 400);

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return fail("Admin not found", 404);
    if (!admin.otp || admin.otp !== Number(otp)) return fail("Invalid OTP", 400);
    if (admin.otpExpiresAt && admin.otpExpiresAt < new Date()) return fail("OTP expired", 400);

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = null;
    admin.otpExpiresAt = null;
    await admin.save();

    return ok({}, "Password changed");
  } catch (e) {
    return serverError(e);
  }
}
