import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import GalleryImage from "@/models/GalleryImage";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const data = await req.json();
    const updates = {};
    for (const k of ["title", "caption", "category"]) if (data[k] !== undefined) updates[k] = String(data[k]);
    const image = await GalleryImage.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!image) return fail("Image not found", 404);
    return ok({ image }, "Image updated");
  } catch (e) {
    return serverError(e);
  }
}

// Removes the DB record. ImgBB's public API has no delete endpoint, so the hosted
// file can only be removed by opening its stored deleteUrl; it is returned for the admin UI.
export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const deleted = await GalleryImage.findByIdAndDelete(id).lean();
    if (!deleted) return fail("Image not found", 404);
    return ok({ deleteUrl: deleted.deleteUrl || "" }, "Image deleted");
  } catch (e) {
    return serverError(e);
  }
}
