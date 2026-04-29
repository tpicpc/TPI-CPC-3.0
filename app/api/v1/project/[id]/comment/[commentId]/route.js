import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Project from "@/models/Project";

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id, commentId } = await params;

    const project = await Project.findById(id);
    if (!project) return fail("Project not found", 404);

    const comment = project.comments.id(commentId);
    if (!comment) return fail("Comment not found", 404);

    const isAdmin = auth.user.role === "admin";
    const isAuthor = String(comment.user) === auth.user.id;
    const isOwner = String(project.owner) === auth.user.id;
    if (!isAdmin && !isAuthor && !isOwner) return fail("Forbidden", 403);

    project.comments.pull({ _id: commentId });
    await project.save();
    return ok({}, "Comment deleted");
  } catch (e) {
    return serverError(e);
  }
}
