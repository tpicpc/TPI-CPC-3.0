import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import { connectDB } from "@/lib/db";
import Advisor from "@/models/Advisor";
import Blog from "@/models/Blog";
import Event from "@/models/Event";
import Leaderboard from "@/models/Leaderboard";
import Notice from "@/models/Notice";
import Review from "@/models/Review";
import Team from "@/models/Team";
import User from "@/models/User";
import Workshop from "@/models/Workshop";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const [users, teams, advisors, events, workshops, blogs, reviews, notices, leaderboard] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Advisor.countDocuments(),
      Event.countDocuments(),
      Workshop.countDocuments(),
      Blog.countDocuments(),
      Review.countDocuments(),
      Notice.countDocuments({ isActive: true }),
      Leaderboard.countDocuments(),
    ]);
    return ok({ stats: { users, teams, advisors, events, workshops, blogs, reviews, notices, leaderboard } });
  } catch (e) {
    return serverError(e);
  }
}
