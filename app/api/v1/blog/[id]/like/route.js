import { connectDB } from "@/lib/db";
import { authError, getTokenFromRequest, requireAuth, verifyToken } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { blogLookup, isPubliclyVisible } from "@/lib/blog-server";
import Blog from "@/models/Blog";

// GET: like count + whether the signed-in viewer has liked the post.
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findOne(blogLookup(id)).select("_id likeCount").lean();
    if (!blog) return fail("Blog not found", 404);
    let liked = false;
    const token = getTokenFromRequest(req);
    const payload = token && verifyToken(token);
    if (payload?.role === "user" && payload.id) {
      liked = !!(await Blog.exists({ _id: blog._id, likes: payload.id }));
    }
    return ok({ likeCount: blog.likeCount || 0, liked });
  } catch (e) {
    return serverError(e);
  }
}

// POST: toggle the signed-in user's like (one per user). Atomic, so double clicks can't double count.
export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findOne(blogLookup(id)).select("_id status").lean();
    if (!blog || !isPubliclyVisible(blog)) return fail("Blog not found", 404);

    const userId = auth.user.id;
    let updated = await Blog.findOneAndUpdate(
      { _id: blog._id, likes: { $ne: userId } },
      { $addToSet: { likes: userId }, $inc: { likeCount: 1 } },
      { new: true, projection: { likeCount: 1 } }
    ).lean();
    let liked = true;
    if (!updated) {
      updated = await Blog.findOneAndUpdate(
        { _id: blog._id, likes: userId },
        { $pull: { likes: userId }, $inc: { likeCount: -1 } },
        { new: true, projection: { likeCount: 1 } }
      ).lean();
      liked = false;
    }
    return ok({ liked, likeCount: Math.max(0, updated?.likeCount || 0) });
  } catch (e) {
    return serverError(e);
  }
}
