import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { generateOTP, otpExpiry, sendOtpEmail } from "@/lib/mailer";
import { isValidEmail } from "@/lib/validators";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!isValidEmail(email)) return fail("Invalid email", 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail("No account with that email", 404);

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = otpExpiry(10);
    await user.save();

    await sendOtpEmail(user.email, otp);
    return ok({}, "OTP sent");
  } catch (e) {
    return serverError(e);
  }
}
