import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Project from "@/models/Project";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const project = await Project.findById(id);
    if (!project) return fail("Project not found", 404);

    const userId = auth.user.id;
    const idx = project.likes.findIndex((u) => String(u) === userId);
    let liked;
    if (idx === -1) {
      project.likes.push(userId);
      liked = true;
    } else {
      project.likes.splice(idx, 1);
      liked = false;
    }
    await project.save();

    return ok({ liked, likeCount: project.likes.length });
  } catch (e) {
    return serverError(e);
  }
}
