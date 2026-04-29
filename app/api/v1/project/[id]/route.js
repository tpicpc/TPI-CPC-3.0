import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { authError, getTokenFromRequest, requireAuth, verifyToken } from "@/lib/auth";
import Project from "@/models/Project";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id)
      .populate("owner", "fullName profileImage department shift")
      .lean();
    if (!project) return fail("Project not found", 404);

    let viewerId = null;
    let viewerRole = null;
    const token = getTokenFromRequest(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload?.id) { viewerId = payload.id; viewerRole = payload.role; }
    }

    // Only show non-approved projects to admins or the owner
    if (project.status !== "approved") {
      if (viewerRole !== "admin" && String(project.owner?._id) !== viewerId) {
        return fail("Project not found", 404);
      }
    }

    const liked = viewerId ? (project.likes || []).some((u) => String(u) === viewerId) : false;
    const likeCount = (project.likes || []).length;

    return ok({
      project: { ...project, likes: undefined, likeCount, liked },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const project = await Project.findById(id);
    if (!project) return fail("Project not found", 404);
    if (auth.user.role !== "admin" && String(project.owner) !== auth.user.id) {
      return fail("Forbidden", 403);
    }
    await Project.findByIdAndDelete(id);
    return ok({}, "Project deleted");
  } catch (e) {
    return serverError(e);
  }
}
