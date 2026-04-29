import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import User from "@/models/User";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const user = await User.findById(auth.user.id).select("-password -otp -otpExpiresAt -verifyOtp -verifyOtpExpiresAt").lean();
    if (!user) return fail("User not found", 404);
    return ok({ user });
  } catch (e) {
    return serverError(e);
  }
}
