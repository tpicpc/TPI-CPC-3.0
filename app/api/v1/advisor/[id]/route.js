import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Advisor from "@/models/Advisor";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const updates = {};
    for (const k of ["name", "position", "gender"]) {
      if (data[k] !== undefined) updates[k] = data[k];
    }
    if (data.order !== undefined) updates.order = Number(data.order);
    const file = formData.get("advisorProfile");
    if (file && typeof file !== "string") {
      updates.advisorProfile = await uploadFormFileToImgBB(file);
    }

    const advisor = await Advisor.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!advisor) return fail("Advisor not found", 404);
    return ok({ advisor }, "Advisor updated");
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
    const deleted = await Advisor.findByIdAndDelete(id);
    if (!deleted) return fail("Advisor not found", 404);
    return ok({}, "Advisor deleted");
  } catch (e) {
    return serverError(e);
  }
}
