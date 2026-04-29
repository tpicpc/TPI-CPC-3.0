import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { generateOTP, otpExpiry, sendOtpEmail } from "@/lib/mailer";
import { isValidEmail } from "@/lib/validators";
import Admin from "@/models/Admin";

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();
    if (!isValidEmail(email)) return fail("Invalid email", 400);
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return fail("No admin with that email", 404);
    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpiresAt = otpExpiry(10);
    await admin.save();
    await sendOtpEmail(admin.email, otp);
    return ok({}, "OTP sent");
  } catch (e) {
    return serverError(e);
  }
}
