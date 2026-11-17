import { slugify } from "@/lib/blog-content";
import LearningTopic from "@/models/LearningTopic";

export const FIELDS = ["title", "slug", "level", "description", "order", "published", "items"];

export async function prepareTopic(data, { id } = {}) {
  if (data.title !== undefined || data.slug !== undefined) {
    let base = slugify(data.slug || data.title || "") || "topic";
    let slug = base;
    for (let i = 2; await LearningTopic.exists({ slug, ...(id ? { _id: { $ne: id } } : {}) }); i++) slug = `${base}-${i}`;
    data.slug = slug;
  }
  if (Array.isArray(data.items)) {
    data.items = data.items
      .filter((i) => i && String(i.title || "").trim())
      .map((i) => ({
        ...(i._id ? { _id: i._id } : {}),
        title: String(i.title).trim().slice(0, 160),
        url: String(i.url || "").trim().slice(0, 500),
        kind: i.kind || "problem",
        platform: String(i.platform || "").slice(0, 40),
        difficulty: String(i.difficulty || "").slice(0, 30),
        note: String(i.note || "").slice(0, 300),
      }));
  }
  return data;
}
