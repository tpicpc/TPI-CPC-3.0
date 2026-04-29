import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import Workshop from "@/models/Workshop";

export async function GET(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const user = await User.findById(id)
      .select("-password -otp -otpExpiresAt -verifyOtp -verifyOtpExpiresAt")
      .lean();
    if (!user) return fail("User not found", 404);

    const enrollments = await Enrollment.find({ user: id })
      .sort({ createdAt: -1 })
      .lean();

    const workshopIds = enrollments.map((e) => e.workshop);
    const workshops = await Workshop.find({ _id: { $in: workshopIds } })
      .select("title slug thumbnail category level")
      .lean();
    const wMap = new Map(workshops.map((w) => [String(w._id), w]));

    const enriched = enrollments.map((e) => ({
      ...e,
      workshop: wMap.get(String(e.workshop)) || null,
    }));

    return ok({ user, enrollments: enriched });
  } catch (e) {
    return serverError(e);
  }
}

// Block / suspend / unban / activate a user
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { status, reason } = await req.json();

    if (!["active", "suspended", "banned"].includes(status)) {
      return fail("Invalid status — must be active, suspended, or banned", 400);
    }

    const updates = { status };
    if (status === "active") {
      updates.suspendedReason = "";
      updates.suspendedAt = null;
      updates.suspendedBy = null;
    } else {
      updates.suspendedReason = reason || "";
      updates.suspendedAt = new Date();
      updates.suspendedBy = auth.user.id;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true })
      .select("-password -otp -otpExpiresAt -verifyOtp -verifyOtpExpiresAt")
      .lean();
    if (!user) return fail("User not found", 404);

    const msg =
      status === "active" ? "Account reactivated" :
      status === "suspended" ? "Account suspended" :
      "Account banned";
    return ok({ user }, msg);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return fail("User not found", 404);
    await Enrollment.deleteMany({ user: id });
    return ok({}, "User deleted");
  } catch (e) {
    return serverError(e);
  }
}
