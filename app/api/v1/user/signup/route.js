import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { signToken } from "@/lib/auth";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import { generate4DigitOTP, otpExpiry, sendVerifyEmail } from "@/lib/mailer";
import { isValidEmail, passwordStrength, requireFields, slugifyUsername } from "@/lib/validators";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const payload = Object.fromEntries(formData.entries());

    const missing = requireFields(payload, ["fullName", "email", "mobileNumber", "rollNumber", "department", "shift", "password"]);
    if (missing) return fail(missing, 400);
    if (!isValidEmail(payload.email)) return fail("Invalid email", 400);
    const pwd = passwordStrength(payload.password);
    if (!pwd.ok) return fail(pwd.message, 400);

    const exists = await User.findOne({ email: payload.email.toLowerCase() });
    if (exists) return fail("Email already registered", 409);

    // Generate a unique username from full name (or email local-part as fallback)
    const base = slugifyUsername(payload.fullName) || slugifyUsername(payload.email.split("@")[0]) || "member";
    let username = base;
    let n = 1;
    while (await User.findOne({ username })) {
      username = `${base}${n++}`;
    }

    let profileImage = "";
    const file = formData.get("profileImage");
    if (file && typeof file !== "string") {
      try {
        profileImage = await uploadFormFileToImgBB(file);
      } catch (err) {
        return fail("Image upload failed: " + err.message, 400);
      }
    }

    const hashed = await bcrypt.hash(payload.password, 10);
    const verifyOtp = generate4DigitOTP();
    const verifyOtpExpiresAt = otpExpiry(15);

    const user = await User.create({
      fullName: payload.fullName,
      username,
      email: payload.email.toLowerCase(),
      mobileNumber: payload.mobileNumber,
      rollNumber: payload.rollNumber,
      department: payload.department,
      shift: payload.shift,
      password: hashed,
      profileImage,
      emailVerified: false,
      verifyOtp,
      verifyOtpExpiresAt,
    });

    sendVerifyEmail(user.email, user.fullName, verifyOtp).catch((e) =>
      console.warn("Verify email failed:", e?.message || e)
    );

    // Issue token so the verify-email page can call the verify endpoint
    const token = signToken({ id: user._id.toString(), email: user.email, role: "user" });

    return ok({
      token,
      requiresVerification: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: false,
        mobileNumber: user.mobileNumber,
        rollNumber: user.rollNumber,
        department: user.department,
        shift: user.shift,
        profileImage: user.profileImage,
      },
    }, "Account created — check your email for the 4-digit verification code");
  } catch (e) {
    return serverError(e);
  }
}
