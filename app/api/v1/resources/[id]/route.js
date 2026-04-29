import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Resource from "@/models/Resource";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const updates = {};
    for (const k of ["title", "description", "fileUrl", "fileType", "fileSize", "category"]) {
      if (data[k] !== undefined) updates[k] = data[k];
    }
    if (data.tags) updates.tags = JSON.parse(data.tags);
    if (data.featured !== undefined) updates.featured = data.featured === "true";
    const thumb = formData.getAll("thumbnail").find((e) => e && typeof e !== "string");
    if (thumb) updates.thumbnailUrl = await uploadFormFileToImgBB(thumb);

    const resource = await Resource.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!resource) return fail("Not found", 404);
    return ok({ resource }, "Updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const r = await Resource.findByIdAndDelete(id);
    if (!r) return fail("Not found", 404);
    return ok({}, "Deleted");
  } catch (e) {
    return serverError(e);
  }
}
