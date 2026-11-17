import { fail, ok, withAuth } from "@/lib/crud";
import LearningProgress from "@/models/LearningProgress";
import LearningTopic from "@/models/LearningTopic";

// Member: mark an item done / not done
export const POST = withAuth("user", async (req, { params }, me) => {
  const { slug } = await params;
  const { itemId, done } = await req.json();
  const topic = await LearningTopic.findOne({ slug }).select("items._id").lean();
  if (!topic) return fail("Topic not found", 404);
  if (!topic.items.some((i) => String(i._id) === String(itemId))) return fail("Item not found", 404);
  const p = await LearningProgress.findOneAndUpdate(
    { user: me.id, topic: topic._id },
    done ? { $addToSet: { done: itemId } } : { $pull: { done: itemId } },
    { upsert: true, new: true }
  ).lean();
  return ok({ done: p.done.map(String) });
});
