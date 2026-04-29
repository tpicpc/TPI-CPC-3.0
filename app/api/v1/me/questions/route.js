import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Question from "@/models/Question";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const questions = await Question.find({ asker: auth.user.id })
      .sort({ createdAt: -1 })
      .select("title tags views answers upvotes createdAt status")
      .lean();
    return ok({
      questions: questions.map((q) => ({
        ...q,
        voteCount: (q.upvotes || []).length,
        answerCount: (q.answers || []).length,
        hasAccepted: (q.answers || []).some((a) => a.accepted),
        upvotes: undefined,
        answers: undefined,
      })),
    });
  } catch (e) {
    return serverError(e);
  }
}
