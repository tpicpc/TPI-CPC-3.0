import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { generate4DigitOTP, otpExpiry, sendVerifyEmail } from "@/lib/mailer";
import User from "@/models/User";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const user = await User.findById(auth.user.id);
    if (!user) return fail("User not found", 404);
    if (user.emailVerified) return ok({ alreadyVerified: true }, "Email already verified");

    user.verifyOtp = generate4DigitOTP();
    user.verifyOtpExpiresAt = otpExpiry(15);
    await user.save();

    await sendVerifyEmail(user.email, user.fullName, user.verifyOtp);
    return ok({}, "A new verification code has been sent to your email");
  } catch (e) {
    return serverError(e);
  }
}
