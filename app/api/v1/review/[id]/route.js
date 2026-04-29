import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Review from "@/models/Review";

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const deleted = await Review.findByIdAndDelete(id);
    if (!deleted) return fail("Review not found", 404);
    return ok({}, "Review deleted");
  } catch (e) {
    return serverError(e);
  }
}
