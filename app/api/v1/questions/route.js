import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Question from "@/models/Question";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const tag = url.searchParams.get("tag");
    const q = url.searchParams.get("q");
    const sort = url.searchParams.get("sort") || "newest"; // newest | top | unanswered

    const filter = { status: "open" };
    if (tag) filter.tags = tag.toLowerCase();
    if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    if (sort === "unanswered") filter.$expr = { $eq: [{ $size: "$answers" }, 0] };

    let query = Question.find(filter).select("-answers.body -body").lean();
    if (sort === "top") query = query.sort({ "upvotes.length": -1, createdAt: -1 });
    else query = query.sort({ createdAt: -1 });

    const list = await query;
    const enriched = list.map((q) => ({
      ...q,
      voteCount: (q.upvotes || []).length,
      answerCount: (q.answers || []).length,
      hasAccepted: (q.answers || []).some((a) => a.accepted),
      upvotes: undefined,
      answers: undefined,
    }));
    return ok({ questions: enriched });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const user = await User.findById(auth.user.id).select("fullName profileImage emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) return fail("Verify your email before posting", 403);

    const { title, body, tags } = await req.json();
    if (!title || title.trim().length < 10) return fail("Title must be at least 10 characters", 400);
    if (!body || body.trim().length < 20) return fail("Body must be at least 20 characters", 400);

    const cleanTags = Array.isArray(tags)
      ? tags.map((t) => String(t).toLowerCase().trim()).filter((t) => /^[a-z0-9-+#.]{1,30}$/i.test(t)).slice(0, 5)
      : [];

    const question = await Question.create({
      title: title.trim(),
      body: body.trim(),
      tags: cleanTags,
      asker: user._id,
      askerName: user.fullName,
      askerAvatar: user.profileImage || "",
    });

    return ok({ question }, "Question posted");
  } catch (e) {
    return serverError(e);
  }
}
