import { ok, fail } from "@/lib/api-response";
import { withAuth } from "@/lib/crud";
import { getUserCpStats } from "@/lib/cp";
import { sanitizePortfolio } from "@/lib/portfolio";
import User from "@/models/User";

const SELECT = "fullName username profileImage headline bio skills github linkedin facebook website handles emailNotifications points badges";

export const GET = withAuth("user", async (_req, _ctx, me) => {
  const user = await User.findById(me.id).select(SELECT).lean();
  if (!user) return fail("User not found", 404);
  const stats = await getUserCpStats(user).catch(() => ({}));
  return ok({ portfolio: user, stats });
});

export const PUT = withAuth("user", async (req, _ctx, me) => {
  const updates = sanitizePortfolio(await req.json());
  const user = await User.findByIdAndUpdate(me.id, { $set: updates }, { new: true }).select(SELECT).lean();
  if (!user) return fail("User not found", 404);
  // Refresh stats for any (possibly new) handles
  const stats = await getUserCpStats(user).catch(() => ({}));
  return ok({ portfolio: user, stats }, "Profile updated");
});
