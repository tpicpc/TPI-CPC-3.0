import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();
    const all = await Team.find().sort({ year: -1, order: 1 }).lean();

    // Use the highest year present in the data as "current"
    const years = [...new Set(all.map((t) => t.year))].sort((a, b) => b - a);
    const currentYear = years[0] || new Date().getFullYear();

    const current = all.filter((t) => t.year === currentYear);
    const past = all
      .filter((t) => t.year !== currentYear)
      .reduce((acc, t) => {
        (acc[t.year] ||= []).push(t);
        return acc;
      }, {});
    return ok({ currentYear, current, past });
  } catch (e) {
    return serverError(e);
  }
}
