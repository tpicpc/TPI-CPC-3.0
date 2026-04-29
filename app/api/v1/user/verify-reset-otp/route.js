import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();
    if (!email || !otp) return fail("Email and OTP required", 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail("User not found", 404);
    if (!user.otp || user.otp !== Number(otp)) return fail("Invalid OTP", 400);
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) return fail("OTP expired", 400);

    return ok({}, "OTP verified");
  } catch (e) {
    return serverError(e);
  }
}
