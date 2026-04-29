import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const verified = url.searchParams.get("verified");
    const status = url.searchParams.get("status"); // active | suspended | banned

    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fullName: re }, { email: re }, { mobileNumber: re },
        { rollNumber: re }, { department: re }, { username: re },
      ];
    }
    if (verified === "true") filter.emailVerified = true;
    else if (verified === "false") filter.emailVerified = { $ne: true };
    if (["active", "suspended", "banned"].includes(status)) filter.status = status;

    const users = await User.find(filter)
      .select("-password -otp -otpExpiresAt -verifyOtp -verifyOtpExpiresAt")
      .sort({ createdAt: -1 })
      .lean();

    // Enrollment counts per user
    const counts = await Enrollment.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const enriched = users.map((u) => ({
      ...u,
      enrollmentCount: countMap.get(String(u._id)) || 0,
    }));

    return ok({
      users: enriched,
      total: enriched.length,
      verifiedCount: enriched.filter((u) => u.emailVerified).length,
      activeCount: enriched.filter((u) => (u.status || "active") === "active").length,
      suspendedCount: enriched.filter((u) => u.status === "suspended").length,
      bannedCount: enriched.filter((u) => u.status === "banned").length,
    });
  } catch (e) {
    return serverError(e);
  }
}
