import { ok, withAuth } from "@/lib/crud";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import User from "@/models/User";

export const GET = withAuth("admin", async (req) => {
  const sp = new URL(req.url).searchParams;
  const q = {};
  if (sp.get("status")) q.status = sp.get("status");
  if (sp.get("challenge")) q.challenge = sp.get("challenge");
  const submissions = await ChallengeSubmission.find(q)
    .sort({ status: 1, createdAt: -1 })
    .limit(300)
    .populate({ path: "challenge", model: Challenge, select: "title points kind" })
    .populate({ path: "user", model: User, select: "fullName username profileImage handles.codeforces" })
    .lean();
  return ok({ submissions });
});
