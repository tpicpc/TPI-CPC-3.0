import { ok, optionalUser, withDB } from "@/lib/crud";
import { challengeState, standings } from "@/lib/challenges";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";

export const dynamic = "force-dynamic";

export const GET = withDB(async (req) => {
  const challenges = await Challenge.find({ published: true }).sort({ startsAt: -1 }).limit(60).lean();
  const ids = challenges.map((c) => c._id);
  const [counts, mine, top] = await Promise.all([
    ChallengeSubmission.aggregate([
      { $match: { challenge: { $in: ids }, status: "accepted" } },
      { $group: { _id: "$challenge", n: { $sum: 1 } } },
    ]),
    (async () => {
      const me = optionalUser(req);
      if (me?.role !== "user") return [];
      return ChallengeSubmission.find({ user: me.id, challenge: { $in: ids } }).select("challenge status points").lean();
    })(),
    standings(10, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  ]);
  const solvedBy = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  const myMap = Object.fromEntries(mine.map((m) => [String(m.challenge), m]));
  return ok({
    challenges: challenges
      .map((c) => ({ ...c, state: challengeState(c), solvedBy: solvedBy[String(c._id)] || 0, mine: myMap[String(c._id)] || null, autoVerify: !!(c.cfContestId && c.cfIndex) }))
      .filter((c) => c.state !== "upcoming"),
    standings: top,
  });
});
