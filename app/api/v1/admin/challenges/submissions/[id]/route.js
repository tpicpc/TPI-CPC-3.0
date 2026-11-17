import { fail, ok, withAuth } from "@/lib/crud";
import { setSubmissionStatus } from "@/lib/challenges";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";

export const PATCH = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const { status, reviewNote } = await req.json();
  if (!["pending", "accepted", "rejected"].includes(status)) return fail("Invalid status", 400);
  const sub = await ChallengeSubmission.findById(id);
  if (!sub) return fail("Submission not found", 404);
  const c = await Challenge.findById(sub.challenge).lean();
  if (!c) return fail("Challenge not found", 404);
  await setSubmissionStatus(sub, c, status, { reviewNote });
  return ok({ submission: sub }, status === "accepted" ? `Accepted · +${c.points} pts` : `Marked ${status}`);
});
