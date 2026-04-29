import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Advisor from "@/models/Advisor";
import Blog from "@/models/Blog";
import Event from "@/models/Event";
import Review from "@/models/Review";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();

    const allTeams = await Team.find().sort({ year: -1, order: 1 }).lean();
    const years = [...new Set(allTeams.map((t) => t.year))].sort((a, b) => b - a);
    const currentTeamYear = years[0] || new Date().getFullYear();

    const teamMembers = allTeams.filter((t) => t.year === currentTeamYear);
    const exTeam = allTeams.filter((t) => t.year !== currentTeamYear);

    const [advisors, events, blogs, reviews] = await Promise.all([
      Advisor.find().sort({ order: 1 }).lean(),
      Event.find().sort({ createdAt: -1 }).limit(10).lean(),
      Blog.find().sort({ createdAt: -1 }).limit(10).lean(),
      Review.find({ approved: true }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return ok({ advisors, teamMembers, exTeam, events, blogs, reviews, currentTeamYear });
  } catch (e) {
    return serverError(e);
  }
}
