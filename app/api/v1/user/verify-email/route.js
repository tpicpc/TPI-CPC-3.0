import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import User from "@/models/User";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { otp } = await req.json();
    if (!otp) return fail("OTP required", 400);

    const user = await User.findById(auth.user.id);
    if (!user) return fail("User not found", 404);
    if (user.emailVerified) return ok({ alreadyVerified: true }, "Email already verified");

    if (!user.verifyOtp || user.verifyOtp !== Number(otp)) return fail("Invalid OTP", 400);
    if (user.verifyOtpExpiresAt && user.verifyOtpExpiresAt < new Date()) {
      return fail("OTP expired — request a new one", 400);
    }

    user.emailVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpiresAt = null;
    await user.save();

    return ok({ verified: true }, "Email verified");
  } catch (e) {
    return serverError(e);
  }
}
