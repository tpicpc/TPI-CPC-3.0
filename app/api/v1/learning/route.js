import { ok, optionalUser, withDB } from "@/lib/crud";
import LearningProgress from "@/models/LearningProgress";
import LearningTopic from "@/models/LearningTopic";

export const dynamic = "force-dynamic";
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Public roadmap; includes the viewer's progress when a member token is sent.
export const GET = withDB(async (req) => {
  const topics = await LearningTopic.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
  const me = optionalUser(req);
  let progress = {};
  if (me?.role === "user") {
    const rows = await LearningProgress.find({ user: me.id }).lean();
    progress = Object.fromEntries(rows.map((r) => [String(r.topic), r.done.map(String)]));
  }
  const list = topics
    .sort((a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) || a.order - b.order)
    .map((t) => {
      const ids = new Set(t.items.map((i) => String(i._id)));
      const done = (progress[String(t._id)] || []).filter((id) => ids.has(id)).length;
      return {
        _id: t._id, title: t.title, slug: t.slug, level: t.level, description: t.description, order: t.order,
        itemCount: t.items.length,
        problemCount: t.items.filter((i) => i.kind === "problem" || i.kind === "practice").length,
        done,
      };
    });
  return ok({ topics: list, loggedIn: me?.role === "user" });
});
