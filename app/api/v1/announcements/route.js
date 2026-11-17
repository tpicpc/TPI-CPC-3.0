import { ok, withDB } from "@/lib/crud";
import Announcement from "@/models/Announcement";

export const dynamic = "force-dynamic";

export const GET = withDB(async (req) => {
  const cat = new URL(req.url).searchParams.get("category");
  const q = { published: true, ...(cat && cat !== "All" ? { category: cat } : {}) };
  const announcements = await Announcement.find(q).sort({ pinned: -1, createdAt: -1 }).limit(100).select("-emailedCount -notifiedAt").lean();
  return ok({ announcements });
});
