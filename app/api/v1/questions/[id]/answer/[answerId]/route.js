import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Question from "@/models/Question";

// PATCH = vote / accept
export async function PATCH(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id, answerId } = await params;
    const { action } = await req.json();
    const q = await Question.findById(id);
    if (!q) return fail("Question not found", 404);
    const a = q.answers.id(answerId);
    if (!a) return fail("Answer not found", 404);

    if (action === "vote") {
      const idx = a.upvotes.findIndex((u) => String(u) === auth.user.id);
      if (idx >= 0) a.upvotes.splice(idx, 1);
      else a.upvotes.push(auth.user.id);
      await q.save();
      return ok({ upvoted: idx < 0, voteCount: a.upvotes.length });
    }

    if (action === "accept") {
      if (String(q.asker) !== auth.user.id) return fail("Only the asker can accept an answer", 403);
      const wasAccepted = a.accepted;
      q.answers.forEach((x) => (x.accepted = false));
      a.accepted = !wasAccepted;
      await q.save();
      return ok({ accepted: a.accepted });
    }

    return fail("Invalid action", 400);
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id, answerId } = await params;
    const q = await Question.findById(id);
    if (!q) return fail("Question not found", 404);
    const a = q.answers.id(answerId);
    if (!a) return fail("Answer not found", 404);
    if (auth.user.role !== "admin" && String(a.author) !== auth.user.id) return fail("Forbidden", 403);
    q.answers.pull({ _id: answerId });
    await q.save();
    return ok({}, "Deleted");
  } catch (e) {
    return serverError(e);
  }
}
