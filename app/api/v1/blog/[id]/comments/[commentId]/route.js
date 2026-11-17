import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Blog from "@/models/Blog";
import BlogComment from "@/models/BlogComment";

// DELETE: the comment's author or any admin.
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { commentId } = await params;

    const comment = await BlogComment.findById(commentId).select("user blog").lean();
    if (!comment) return fail("Comment not found", 404);

    const isAdmin = auth.user.role === "admin";
    const isAuthor = auth.user.role === "user" && String(comment.user) === auth.user.id;
    if (!isAdmin && !isAuthor) return fail("You can only delete your own comments", 403);

    await BlogComment.deleteOne({ _id: comment._id });
    await Blog.updateOne({ _id: comment.blog, commentCount: { $gt: 0 } }, { $inc: { commentCount: -1 } });
    return ok({}, "Comment deleted");
  } catch (e) {
    return serverError(e);
  }
}
