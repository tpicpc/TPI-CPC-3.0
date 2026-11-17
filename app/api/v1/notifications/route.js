import { ok, withAuth } from "@/lib/crud";
import Notification from "@/models/Notification";

export const dynamic = "force-dynamic";

// Member: latest notifications + unread count
export const GET = withAuth("user", async (_req, _ctx, me) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: me.id }).sort({ createdAt: -1 }).limit(30).lean(),
    Notification.countDocuments({ user: me.id, read: false }),
  ]);
  return ok({ notifications, unread });
});

// Member: mark read — { id } for one, or {} for all
export const PATCH = withAuth("user", async (req, _ctx, me) => {
  const { id } = await req.json().catch(() => ({}));
  await Notification.updateMany({ user: me.id, read: false, ...(id ? { _id: id } : {}) }, { read: true });
  return ok({ unread: await Notification.countDocuments({ user: me.id, read: false }) });
});
