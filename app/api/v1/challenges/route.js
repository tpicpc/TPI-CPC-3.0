import { ok, optionalUser, withDB } from "@/lib/crud";
import { challengeState, standings } from "@/lib/challenges";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Public list: active + past challenges with stats; upcoming ones are teasers (no problem link).
export const GET = withDB(async (req) => {
  const challenges = await Challenge.find({ published: true }).sort({ startsAt: -1 }).limit(80).select("-statement -sampleInput -sampleOutput").lean();
  const ids = challenges.map((c) => c._id);
  const me = optionalUser(req);
  const isUser = me?.role === "user";
  const [counts, mine, top, meUser] = await Promise.all([
    ChallengeSubmission.aggregate([
      { $match: { challenge: { $in: ids } } },
      { $group: { _id: "$challenge", solved: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } }, tried: { $sum: 1 } } },
    ]),
    isUser ? ChallengeSubmission.find({ user: me.id, challenge: { $in: ids } }).select("challenge status points").lean() : [],
    standings(10, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    isUser ? User.findById(me.id).select("points").lean() : null,
  ]);
  const stat = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  const myMap = Object.fromEntries(mine.map((m) => [String(m.challenge), m]));

  const list = challenges.map((c) => {
    const state = challengeState(c);
    const s = stat[String(c._id)] || { solved: 0, tried: 0 };
    const base = {
      _id: c._id, title: c.title, kind: c.kind, difficulty: c.difficulty, points: c.points, platform: c.platform, tags: c.tags || [],
      startsAt: c.startsAt, endsAt: c.endsAt, state, solvedBy: s.solved, attemptedBy: s.tried,
    };
    if (state === "upcoming") return base; // don't leak the problem before it opens
    const m = myMap[String(c._id)];
    return {
      ...base, description: c.description, autoVerify: !!(c.cfContestId && c.cfIndex),
      mine: m ? { status: m.status, points: m.points } : null,
    };
  });

  const solvedIds = mine.filter((m) => m.status === "accepted");
  return ok({
    challenges: list.sort((a, b) => {
      const order = { active: 0, upcoming: 1, ended: 2 };
      if (order[a.state] !== order[b.state]) return order[a.state] - order[b.state];
      if (a.state === "upcoming") return new Date(a.startsAt) - new Date(b.startsAt);
      if (a.state === "active") return new Date(a.endsAt || 8.64e15) - new Date(b.endsAt || 8.64e15);
      return new Date(b.startsAt) - new Date(a.startsAt);
    }),
    standings: top,
    me: isUser ? {
      points: meUser?.points || 0,
      solved: solvedIds.length,
      attempted: mine.filter((m) => m.status !== "accepted").length,
      pointsFromChallenges: solvedIds.reduce((n, m) => n + (m.points || 0), 0),
    } : null,
  });
});
