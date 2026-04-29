import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import Review from "@/models/Review";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let filter = { approved: true };

    if (status) {
      // Admins can request other statuses (pending / all)
      const token = getTokenFromRequest(req);
      const payload = token && verifyToken(token);
      if (payload?.role === "admin") {
        if (status === "all") filter = {};
        else if (status === "pending") filter = { approved: false };
        else if (status === "approved") filter = { approved: true };
      }
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
    return ok({ reviews });
  } catch (e) {
    return serverError(e);
  }
}
