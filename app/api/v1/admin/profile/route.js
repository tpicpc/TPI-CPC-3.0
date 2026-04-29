import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Admin from "@/models/Admin";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const admin = await Admin.findById(auth.user.id).select("-password -otp -otpExpiresAt").lean();
    if (!admin) return fail("Admin not found", 404);
    return ok({ admin });
  } catch (e) {
    return serverError(e);
  }
}
