import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import Blog from "@/models/Blog";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    // Treat blogs with missing status (legacy/imported records) as approved
    let filter = { $or: [{ status: "approved" }, { status: { $exists: false } }, { status: null }] };
    if (status) {
      // Only admins can request other statuses (e.g. ?status=pending)
      const token = getTokenFromRequest(req);
      const payload = token && verifyToken(token);
      if (payload?.role === "admin") {
        filter = status === "all" ? {} : { status };
      }
    }

    const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();
    return ok({ blogs });
  } catch (e) {
    return serverError(e);
  }
}
