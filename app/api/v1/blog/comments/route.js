import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import BlogComment from "@/models/BlogComment";
import "@/models/Blog";

// Admin moderation feed: latest comments across all posts, including IP and user agent.
export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const filter = q
      ? { $or: [{ text: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }, { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }, { ip: q }] }
      : {};
    const comments = await BlogComment.find(filter)
      .select("+ip +userAgent")
      .sort({ createdAt: -1 })
      .limit(300)
      .populate("blog", "title slug")
      .lean();
    return ok({ comments });
  } catch (e) {
    return serverError(e);
  }
}
