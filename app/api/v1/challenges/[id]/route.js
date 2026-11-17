import { fail, ok, optionalUser, withDB } from "@/lib/crud";
import { challengeState } from "@/lib/challenges";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// When the accepted solution was submitted (auto: verification time; manual: the link submission).
function acceptedAt(s) {
  if (s.method === "auto") return s.reviewedAt || s.updatedAt;
  const manual = (s.attempts || []).filter((a) => a.method === "manual" && a.link === s.link).pop();
  return manual?.at || s.createdAt || s.reviewedAt;
}

export const GET = withDB(async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Challenge not found", 404);
  const c = await Challenge.findOne({ _id: id, published: true }).lean();
  if (!c) return fail("Challenge not found", 404);
  const state = challengeState(c);

  if (state === "upcoming") {
    // teaser only: title, timing and reward, so the countdown page works
    return ok({
      challenge: { _id: c._id, title: c.title, kind: c.kind, difficulty: c.difficulty, points: c.points, platform: c.platform, tags: c.tags || [], startsAt: c.startsAt, endsAt: c.endsAt, state },
      leaderboard: [], stats: { solved: 0, attempted: 0, rate: 0 }, mine: null, history: [], myCfHandle: "",
    });
  }

  const me = optionalUser(req);
  const isUser = me?.role === "user";
  const [subs, mine, user] = await Promise.all([
    ChallengeSubmission.find({ challenge: id })
      .populate({ path: "user", model: User, select: "fullName username profileImage handles.codeforces" })
      .select("user method status reviewedAt createdAt updatedAt points link attempts").lean(),
    isUser ? ChallengeSubmission.findOne({ challenge: id, user: me.id }).lean() : null,
    isUser ? User.findById(me.id).select("handles.codeforces").lean() : null,
  ]);
  const start = new Date(c.startsAt).getTime();
  const accepted = subs
    .filter((s) => s.status === "accepted" && s.user)
    .map((s) => {
      const at = acceptedAt(s);
      return {
        _id: s._id,
        user: { _id: s.user._id, fullName: s.user.fullName, username: s.user.username, profileImage: s.user.profileImage },
        method: s.method, points: s.points, acceptedAt: at,
        minutes: at ? Math.max(0, Math.round((new Date(at).getTime() - start) / 60000)) : null,
        tries: Math.max(1, (s.attempts || []).filter((a) => a.method !== "review").length),
      };
    })
    .sort((a, b) => new Date(a.acceptedAt) - new Date(b.acceptedAt))
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // My history (fallback for submissions made before history was tracked)
  let history = [];
  if (mine) {
    history = (mine.attempts || []).length
      ? [...mine.attempts].reverse()
      : [{ _id: "legacy", at: mine.createdAt, method: mine.method, link: mine.link, result: mine.status === "accepted" ? "accepted" : mine.status === "rejected" ? "rejected" : "pending", message: mine.reviewNote || "" }];
  }
  const attempted = subs.length;
  return ok({
    challenge: { ...c, state, autoVerify: !!(c.cfContestId && c.cfIndex) },
    leaderboard: accepted.slice(0, 50),
    stats: { solved: accepted.length, attempted, rate: attempted ? Math.round((accepted.length / attempted) * 100) : 0 },
    mine: mine ? { status: mine.status, points: mine.points, method: mine.method, link: mine.link, reviewNote: mine.reviewNote, reviewedAt: mine.reviewedAt, myRank: accepted.find((a) => String(a.user._id) === String(me.id))?.rank || null } : null,
    history,
    myCfHandle: user?.handles?.codeforces || "",
  });
});
