import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Project from "@/models/Project";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const projects = await Project.find({ owner: auth.user.id })
      .sort({ createdAt: -1 })
      .select("-comments")
      .lean();
    return ok({
      projects: projects.map((p) => ({ ...p, likeCount: (p.likes || []).length, likes: undefined })),
    });
  } catch (e) {
    return serverError(e);
  }
}
