import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Enrollment from "@/models/Enrollment";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const enrollments = await Enrollment.find({ user: auth.user.id })
      .populate({ path: "workshop", select: "title slug thumbnail category level instructor" })
      .sort({ createdAt: -1 })
      .lean();
    return ok({ enrollments: enrollments.filter((e) => e.workshop) });
  } catch (e) {
    return serverError(e);
  }
}
