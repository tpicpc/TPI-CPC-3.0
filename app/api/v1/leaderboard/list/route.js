import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Leaderboard from "@/models/Leaderboard";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");
    const year = yearParam ? Number(yearParam) : new Date().getFullYear();

    const [entries, years] = await Promise.all([
      Leaderboard.find({ year }).sort({ points: -1 }).lean(),
      Leaderboard.distinct("year"),
    ]);

    return ok({ year, years: years.sort((a, b) => b - a), entries });
  } catch (e) {
    return serverError(e);
  }
}
