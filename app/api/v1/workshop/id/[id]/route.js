import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Workshop from "@/models/Workshop";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const workshop = await Workshop.findById(id).lean();
    if (!workshop) return fail("Workshop not found", 404);
    return ok({ workshop });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const contentType = req.headers.get("content-type") || "";
    const updates = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const data = Object.fromEntries(formData.entries());
      for (const k of ["title", "description", "instructor", "category", "level", "playlistUrl", "status"]) {
        if (data[k] !== undefined) updates[k] = data[k];
      }
      if (data.lessons) updates.lessons = JSON.parse(data.lessons);
      if (data.tags) updates.tags = JSON.parse(data.tags);
      if (data.featured !== undefined) updates.featured = data.featured === "true";
      if (data.releaseDate !== undefined) {
        updates.releaseDate = data.releaseDate ? new Date(data.releaseDate) : null;
      }
      const file = formData.getAll("thumbnail").find((e) => e && typeof e !== "string");
      if (file) updates.thumbnail = await uploadFormFileToImgBB(file);
    } else {
      const body = await req.json();
      Object.assign(updates, body);
    }

    const workshop = await Workshop.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!workshop) return fail("Workshop not found", 404);
    return ok({ workshop }, "Workshop updated");
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
    const deleted = await Workshop.findByIdAndDelete(id);
    if (!deleted) return fail("Workshop not found", 404);
    return ok({}, "Workshop deleted");
  } catch (e) {
    return serverError(e);
  }
}
