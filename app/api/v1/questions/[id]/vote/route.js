import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Question from "@/models/Question";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const q = await Question.findById(id);
    if (!q) return fail("Not found", 404);
    const idx = q.upvotes.findIndex((u) => String(u) === auth.user.id);
    if (idx >= 0) q.upvotes.splice(idx, 1);
    else q.upvotes.push(auth.user.id);
    await q.save();
    return ok({ upvoted: idx < 0, voteCount: q.upvotes.length });
  } catch (e) {
    return serverError(e);
  }
}
