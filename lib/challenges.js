import ChallengeSubmission from "@/models/ChallengeSubmission";
import { applyPoints } from "@/lib/points";
import { notify } from "@/lib/notify";

export function challengeState(c) {
  const now = Date.now();
  if (c.startsAt && new Date(c.startsAt).getTime() > now) return "upcoming";
  if (c.endsAt && new Date(c.endsAt).getTime() < now) return "ended";
  return "active";
}

/** Move a submission to a new status, keeping points (User + Leaderboard) in sync. */
export async function setSubmissionStatus(sub, challenge, status, { method, reviewNote } = {}) {
  const prevStatus = sub.status;
  const prevPoints = sub.status === "accepted" ? sub.points || 0 : 0;
  const nextPoints = status === "accepted" ? challenge.points || 0 : 0;
  sub.status = status;
  sub.points = nextPoints;
  if (method) sub.method = method;
  if (reviewNote !== undefined) sub.reviewNote = reviewNote;
  sub.reviewedAt = new Date();
  if (status !== prevStatus || method === "auto") {
    sub.attempts = [...(sub.attempts || []), {
      at: new Date(), method: method === "auto" ? "auto" : "review",
      result: status === "accepted" ? "accepted" : status === "rejected" ? "rejected" : "pending",
      link: sub.link || "", message: reviewNote || "",
    }].slice(-30);
  }
  await sub.save();
  const delta = nextPoints - prevPoints;
  if (delta) {
    await applyPoints(sub.user, delta, { contributions: status === "accepted" ? 1 : -1 });
  }
  if (status !== "pending" && status !== prevStatus) {
    await notify(sub.user, {
      title: status === "accepted" ? `+${nextPoints} pts — "${challenge.title}" accepted` : `Submission for "${challenge.title}" was not accepted`,
      body: status === "accepted" ? "Nice work! Points were added to your profile." : reviewNote || "Check the problem again and resubmit with an accepted-submission link.",
      link: `/challenges/${challenge._id}`,
      kind: "challenge",
    }).catch(() => {});
  }
  return sub;
}

export async function standings(limit = 10, since) {
  const match = { status: "accepted", ...(since ? { reviewedAt: { $gte: since } } : {}) };
  return ChallengeSubmission.aggregate([
    { $match: match },
    { $group: { _id: "$user", points: { $sum: "$points" }, solved: { $sum: 1 } } },
    { $sort: { points: -1, solved: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
    { $unwind: "$u" },
    { $project: { points: 1, solved: 1, name: "$u.fullName", username: "$u.username", profileImage: "$u.profileImage" } },
  ]);
}
