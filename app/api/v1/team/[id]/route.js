import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Team from "@/models/Team";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const updates = {};
    for (const k of [
      "name", "position", "gender", "bio",
      "email", "mobileNumber", "rollNumber", "department", "shift", "session",
      "facebook", "linkedin", "github",
    ]) {
      if (data[k] !== undefined) updates[k] = data[k];
    }
    if (data.year) updates.year = Number(data.year);
    if (data.order !== undefined) updates.order = Number(data.order);

    // Pick the File entry (ignore any string values that may share the key)
    const file = formData.getAll("memberProfile").find((e) => e && typeof e !== "string");
    if (file) {
      updates.memberProfile = await uploadFormFileToImgBB(file);
    }

    const team = await Team.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!team) return fail("Member not found", 404);
    return ok({ team }, "Team member updated");
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
    const deleted = await Team.findByIdAndDelete(id);
    if (!deleted) return fail("Member not found", 404);
    return ok({}, "Team member deleted");
  } catch (e) {
    return serverError(e);
  }
}
