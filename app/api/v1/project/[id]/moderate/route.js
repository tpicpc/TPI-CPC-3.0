import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Project from "@/models/Project";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { action, reason, featured } = await req.json();

    const updates = {};
    if (action === "approve") { updates.status = "approved"; updates.rejectionReason = ""; }
    else if (action === "reject") { updates.status = "rejected"; updates.rejectionReason = reason || ""; }
    if (typeof featured === "boolean") updates.featured = featured;

    if (Object.keys(updates).length === 0) return fail("No action provided", 400);

    const project = await Project.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!project) return fail("Project not found", 404);
    return ok({ project }, "Project updated");
  } catch (e) {
    return serverError(e);
  }
}
