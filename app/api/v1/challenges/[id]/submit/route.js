import { fail, ok, withAuth } from "@/lib/crud";
import { challengeState, setSubmissionStatus } from "@/lib/challenges";
import { cfSolvedSince } from "@/lib/cp";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import User from "@/models/User";

const LINK_RE = /^https?:\/\/[^\s]+$/i;

// Member: submit an accepted-submission link, or ask for Codeforces auto-verification.
export const POST = withAuth("user", async (req, { params }, me) => {
  const { id } = await params;
  const { link = "", note = "", auto = false } = await req.json();
  const c = await Challenge.findOne({ _id: id, published: true });
  if (!c) return fail("Challenge not found", 404);
  const state = challengeState(c);
  if (state !== "active") return fail(state === "ended" ? "This challenge has ended" : "Not started yet", 400);

  let sub = await ChallengeSubmission.findOne({ challenge: id, user: me.id });
  if (sub?.status === "accepted") return ok({ submission: sub }, "Already accepted");

  const user = await User.findById(me.id).select("fullName handles").lean();
  if (!user) return fail("User not found", 404);

  // 1) Codeforces auto-verify
  if (auto) {
    if (!c.cfContestId || !c.cfIndex) return fail("Auto-verify isn't available for this challenge", 400);
    const handle = user.handles?.codeforces;
    if (!handle) return fail("Add your Codeforces handle in Dashboard → Public profile first", 400);
    let hit;
    try {
      hit = await cfSolvedSince(handle, c.cfContestId, c.cfIndex, c.startsAt);
    } catch {
      return fail("Couldn't reach Codeforces right now — try again or submit a link", 502);
    }
    if (!hit) return fail(`No accepted submission by ${handle} for ${c.cfContestId}${c.cfIndex} since the challenge started`, 404);
    const autoLink = `https://codeforces.com/contest/${c.cfContestId}/submission/${hit.id}`;
    if (!sub) sub = new ChallengeSubmission({ challenge: id, user: me.id });
    sub.name = user.fullName;
    sub.link = autoLink;
    await setSubmissionStatus(sub, c, "accepted", { method: "auto" });
    return ok({ submission: sub }, `Verified on Codeforces! +${c.points} points`);
  }

  // 2) Manual link → pending admin review
  const url = String(link).trim();
  if (!LINK_RE.test(url) || url.length > 500) return fail("Paste the full link to your accepted submission", 400);
  if (!sub) sub = new ChallengeSubmission({ challenge: id, user: me.id });
  sub.name = user.fullName;
  sub.link = url;
  sub.note = String(note).slice(0, 300);
  sub.status = "pending";
  sub.method = "manual";
  await sub.save();
  return ok({ submission: sub }, "Submitted — an admin will review it soon");
});
