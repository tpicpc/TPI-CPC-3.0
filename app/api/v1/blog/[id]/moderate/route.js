import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { sendBlogApprovedEmail } from "@/lib/mailer";
import Blog from "@/models/Blog";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { action, reason } = await req.json();

    if (!["approve", "reject"].includes(action)) return fail("Invalid action", 400);

    const before = await Blog.findById(id).lean();
    if (!before) return fail("Blog not found", 404);

    const updates =
      action === "approve"
        ? { status: "approved", approvedAt: new Date(), rejectionReason: "" }
        : { status: "rejected", rejectionReason: reason || "" };

    const blog = await Blog.findByIdAndUpdate(id, updates, { new: true }).lean();

    // Fire-and-forget approval email when transitioning into approved + author is a member
    if (action === "approve" && before.status !== "approved" && before.submittedBy) {
      try {
        const author = await User.findById(before.submittedBy).select("fullName email").lean();
        if (author?.email) {
          sendBlogApprovedEmail(author.email, author.fullName, blog).catch((e) =>
            console.warn("Blog approved email failed:", e?.message || e)
          );
        }
      } catch (e) {
        console.warn("Blog approved email lookup failed:", e?.message || e);
      }
    }

    return ok({ blog }, action === "approve" ? "Blog approved & published" : "Blog rejected");
  } catch (e) {
    return serverError(e);
  }
}
