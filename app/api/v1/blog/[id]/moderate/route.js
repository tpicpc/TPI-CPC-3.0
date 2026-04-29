import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Blog from "@/models/Blog";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { action, reason } = await req.json();

    if (!["approve", "reject"].includes(action)) return fail("Invalid action", 400);

    const updates =
      action === "approve"
        ? { status: "approved", approvedAt: new Date(), rejectionReason: "" }
        : { status: "rejected", rejectionReason: reason || "" };

    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!blog) return fail("Blog not found", 404);
    return ok({ blog }, action === "approve" ? "Blog approved & published" : "Blog rejected");
  } catch (e) {
    return serverError(e);
  }
}
