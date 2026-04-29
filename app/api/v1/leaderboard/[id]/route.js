import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Leaderboard from "@/models/Leaderboard";

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
      for (const k of ["name", "department", "rollNumber", "badge", "handle"]) {
        if (data[k] !== undefined) updates[k] = data[k];
      }
      for (const k of ["points", "contributions", "contestsWon", "year"]) {
        if (data[k] !== undefined) updates[k] = Number(data[k]);
      }
      const file = formData.get("profileImage");
      if (file && typeof file !== "string") updates.profileImage = await uploadFormFileToImgBB(file);
    } else {
      const body = await req.json();
      Object.assign(updates, body);
    }

    const entry = await Leaderboard.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!entry) return fail("Entry not found", 404);
    return ok({ entry }, "Entry updated");
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
    const deleted = await Leaderboard.findByIdAndDelete(id);
    if (!deleted) return fail("Entry not found", 404);
    return ok({}, "Entry deleted");
  } catch (e) {
    return serverError(e);
  }
}
