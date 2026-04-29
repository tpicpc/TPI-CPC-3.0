import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { authError, requireAuth } from "@/lib/auth";
import ContactMessage from "@/models/ContactMessage";

export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const update = {};
    if (typeof body.read === "boolean") update.read = body.read;
    if (body.replied) update.repliedAt = new Date();

    const doc = await ContactMessage.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return fail("Message not found", 404);

    return ok({ message: doc }, "Updated");
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
    const doc = await ContactMessage.findByIdAndDelete(id);
    if (!doc) return fail("Message not found", 404);

    return ok({}, "Deleted");
  } catch (e) {
    return serverError(e);
  }
}
