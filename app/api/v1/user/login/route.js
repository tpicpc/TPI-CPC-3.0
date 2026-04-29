import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { signToken } from "@/lib/auth";
import { isValidEmail } from "@/lib/validators";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!isValidEmail(email)) return fail("Invalid email", 400);
    if (!password) return fail("Password required", 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return fail("Invalid credentials", 401);

    if (user.status === "banned") {
      return fail("Your account has been banned. Please contact tpicpc@gmail.com.", 403);
    }
    if (user.status === "suspended") {
      const msg = user.suspendedReason
        ? `Your account is suspended: ${user.suspendedReason}`
        : "Your account is currently suspended. Contact tpicpc@gmail.com.";
      return fail(msg, 403);
    }

    const token = signToken({ id: user._id.toString(), email: user.email, role: "user" });

    return ok({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        emailVerified: !!user.emailVerified,
        mobileNumber: user.mobileNumber,
        rollNumber: user.rollNumber,
        department: user.department,
        shift: user.shift,
        profileImage: user.profileImage,
      },
    }, "Login successful");
  } catch (e) {
    return serverError(e);
  }
}
