import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { signToken } from "@/lib/auth";
import { isValidEmail } from "@/lib/validators";
import Admin from "@/models/Admin";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();
    if (!isValidEmail(email) || !password) return fail("Email and password required", 400);

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) return fail("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return fail("Invalid credentials", 401);

    const token = signToken({ id: admin._id.toString(), email: admin.email, role: "admin" });
    return ok({
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email, adminProfile: admin.adminProfile },
    }, "Admin login successful");
  } catch (e) {
    return serverError(e);
  }
}
