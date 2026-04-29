import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Blog from "@/models/Blog";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const blogs = await Blog.find({ submittedBy: auth.user.id }).sort({ createdAt: -1 }).lean();
    return ok({ blogs });
  } catch (e) {
    return serverError(e);
  }
}
