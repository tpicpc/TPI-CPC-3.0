import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Project from "@/models/Project";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { text } = await req.json();
    if (!text || text.trim().length < 2) return fail("Comment is too short", 400);
    if (text.length > 800) return fail("Comment is too long", 400);

    const user = await User.findById(auth.user.id).select("fullName profileImage emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) return fail("Verify your email before commenting", 403);

    const project = await Project.findById(id);
    if (!project) return fail("Project not found", 404);
    if (project.status !== "approved") return fail("Cannot comment on this project", 403);

    const comment = {
      user: user._id,
      name: user.fullName,
      avatar: user.profileImage || "",
      text: text.trim(),
    };
    project.comments.push(comment);
    await project.save();

    const saved = project.comments[project.comments.length - 1];
    return ok({ comment: saved });
  } catch (e) {
    return serverError(e);
  }
}
