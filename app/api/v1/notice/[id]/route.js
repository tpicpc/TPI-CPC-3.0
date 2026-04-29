import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Notice from "@/models/Notice";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const data = await req.json();
    const updates = {};
    for (const k of ["message", "link"]) if (data[k] !== undefined) updates[k] = data[k];
    if (data.isActive !== undefined) updates.isActive = !!data.isActive;
    if (data.priority !== undefined) updates.priority = Number(data.priority);
    if (data.expiresAt !== undefined) updates.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    const notice = await Notice.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!notice) return fail("Notice not found", 404);
    return ok({ notice }, "Notice updated");
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
    const deleted = await Notice.findByIdAndDelete(id);
    if (!deleted) return fail("Notice not found", 404);
    return ok({}, "Notice deleted");
  } catch (e) {
    return serverError(e);
  }
}
