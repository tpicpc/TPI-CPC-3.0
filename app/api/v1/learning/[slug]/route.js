import { fail, ok, optionalUser, withDB } from "@/lib/crud";
import LearningProgress from "@/models/LearningProgress";
import LearningTopic from "@/models/LearningTopic";

export const dynamic = "force-dynamic";

export const GET = withDB(async (req, { params }) => {
  const { slug } = await params;
  const topic = await LearningTopic.findOne({ slug, published: true }).lean();
  if (!topic) return fail("Topic not found", 404);
  const me = optionalUser(req);
  let done = [];
  if (me?.role === "user") {
    const p = await LearningProgress.findOne({ user: me.id, topic: topic._id }).lean();
    done = (p?.done || []).map(String);
  }
  const siblings = await LearningTopic.find({ published: true, level: topic.level }).sort({ order: 1, createdAt: 1 }).select("title slug").lean();
  const idx = siblings.findIndex((s) => s.slug === slug);
  return ok({ topic, done, loggedIn: me?.role === "user", prev: siblings[idx - 1] || null, next: siblings[idx + 1] || null });
});
