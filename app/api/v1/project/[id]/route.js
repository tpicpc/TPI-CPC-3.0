import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { authError, getTokenFromRequest, requireAuth, verifyToken } from "@/lib/auth";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
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

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const project = await Project.findById(id);
    if (!project) return fail("Project not found", 404);

    const isOwner = String(project.owner) === auth.user.id;
    const isAdmin = auth.user.role === "admin";
    if (!isOwner && !isAdmin) return fail("Forbidden", 403);

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());

    if (data.title !== undefined) {
      if (!data.title.trim()) return fail("Title is required", 400);
      project.title = data.title.trim();
    }
    if (data.description !== undefined) {
      if (data.description.trim().length < 30)
        return fail("Description should be at least 30 characters", 400);
      project.description = data.description.trim();
    }
    if (data.demoUrl !== undefined) project.demoUrl = data.demoUrl;
    if (data.githubUrl !== undefined) project.githubUrl = data.githubUrl;
    if (data.tags !== undefined) {
      try {
        project.tags = JSON.parse(data.tags);
      } catch {
        project.tags = String(data.tags).split(",").map((t) => t.trim()).filter(Boolean);
      }
    }

    // Cover image (replace if a new file is uploaded)
    const coverFile = formData.getAll("coverImage").find((e) => e && typeof e !== "string");
    if (coverFile) {
      try {
        project.coverImage = await uploadFormFileToImgBB(coverFile);
      } catch (err) {
        return fail("Cover image upload failed: " + err.message, 400);
      }
    }

    // Screenshots: keep existing URLs from `existingScreenshots[]` + append new uploads
    const keepRaw = formData.getAll("existingScreenshots");
    const keep = keepRaw.length > 0 ? keepRaw.map(String) : null;
    const newShots = formData.getAll("screenshots").filter((e) => e && typeof e !== "string");
    if (keep !== null || newShots.length > 0) {
      const next = keep !== null ? [...keep] : [...(project.screenshots || [])];
      for (const file of newShots.slice(0, 6 - next.length)) {
        try {
          next.push(await uploadFormFileToImgBB(file));
        } catch (err) {
          console.warn("Screenshot upload failed:", err.message);
        }
      }
      project.screenshots = next;
    }

    // When a non-admin owner edits, send it back through review.
    // Admins editing leave the status untouched.
    if (isOwner && !isAdmin && project.status !== "pending") {
      project.status = "pending";
      project.rejectionReason = "";
    }

    await project.save();

    return ok(
      { project: { _id: project._id, status: project.status } },
      isOwner && !isAdmin
        ? "Project updated — sent back for admin review."
        : "Project updated."
    );
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
