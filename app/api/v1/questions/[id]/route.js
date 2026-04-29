import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { getTokenFromRequest, authError, requireAuth, verifyToken } from "@/lib/auth";
import Question from "@/models/Question";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const question = await Question.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
    if (!question) return fail("Question not found", 404);

    let viewerId = null;
    const token = getTokenFromRequest(req);
    if (token) viewerId = verifyToken(token)?.id;

    return ok({
      question: {
        ...question,
        voteCount: (question.upvotes || []).length,
        upvoted: viewerId ? (question.upvotes || []).some((u) => String(u) === viewerId) : false,
        upvotes: undefined,
        answers: (question.answers || [])
          .map((a) => ({
            ...a,
            voteCount: (a.upvotes || []).length,
            upvoted: viewerId ? (a.upvotes || []).some((u) => String(u) === viewerId) : false,
            upvotes: undefined,
          }))
          .sort((a, b) => (b.accepted ? 1 : 0) - (a.accepted ? 1 : 0) || b.voteCount - a.voteCount),
      },
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const q = await Question.findById(id);
    if (!q) return fail("Question not found", 404);
    if (auth.user.role !== "admin" && String(q.asker) !== auth.user.id) return fail("Forbidden", 403);
    await Question.findByIdAndDelete(id);
    return ok({}, "Deleted");
  } catch (e) {
    return serverError(e);
  }
}
