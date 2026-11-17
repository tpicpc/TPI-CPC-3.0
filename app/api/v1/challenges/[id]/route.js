import { fail, ok, optionalUser, withDB } from "@/lib/crud";
import { challengeState } from "@/lib/challenges";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export const GET = withDB(async (req, { params }) => {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Challenge not found", 404);
  const c = await Challenge.findOne({ _id: id, published: true }).lean();
  if (!c || challengeState(c) === "upcoming") return fail("Challenge not found", 404);
  const me = optionalUser(req);
  const [solvers, mine, user] = await Promise.all([
    ChallengeSubmission.find({ challenge: id, status: "accepted" })
      .sort({ reviewedAt: 1 }).limit(50)
      .populate({ path: "user", model: User, select: "fullName username profileImage" })
      .select("user method reviewedAt points").lean(),
    me?.role === "user" ? ChallengeSubmission.findOne({ challenge: id, user: me.id }).lean() : null,
    me?.role === "user" ? User.findById(me.id).select("handles.codeforces").lean() : null,
  ]);
  return ok({
    challenge: { ...c, state: challengeState(c), autoVerify: !!(c.cfContestId && c.cfIndex) },
    solvers: solvers.filter((s) => s.user),
    mine,
    myCfHandle: user?.handles?.codeforces || "",
  });
});
