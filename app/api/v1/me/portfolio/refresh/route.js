import { ok, fail } from "@/lib/api-response";
import { withAuth } from "@/lib/crud";
import { getUserCpStats } from "@/lib/cp";
import User from "@/models/User";

const lastRefresh = new Map();

// Force-refresh the member's cached CF/CC/AtCoder stats (rate-limited to once / 2 min).
export const POST = withAuth("user", async (_req, _ctx, me) => {
  const last = lastRefresh.get(me.id) || 0;
  if (Date.now() - last < 2 * 60 * 1000) return fail("Please wait a couple of minutes before refreshing again", 429);
  lastRefresh.set(me.id, Date.now());
  const user = await User.findById(me.id).select("handles").lean();
  if (!user) return fail("User not found", 404);
  return ok({ stats: await getUserCpStats(user, { force: true }) }, "Stats refreshed");
});
