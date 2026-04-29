import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Question from "@/models/Question";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const { body } = await req.json();
    if (!body || body.trim().length < 20) return fail("Answer must be at least 20 characters", 400);

    const user = await User.findById(auth.user.id).select("fullName profileImage emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) return fail("Verify your email before posting", 403);

    const q = await Question.findById(id);
    if (!q) return fail("Question not found", 404);
    if (q.status !== "open") return fail("This question is closed", 403);

    q.answers.push({
      author: user._id,
      authorName: user.fullName,
      authorAvatar: user.profileImage || "",
      body: body.trim(),
    });
    await q.save();
    return ok({ answer: q.answers[q.answers.length - 1] }, "Answer posted");
  } catch (e) {
    return serverError(e);
  }
}
