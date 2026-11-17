import { adminItem } from "@/lib/crud";
import { applyPoints } from "@/lib/points";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import { FIELDS, prepare } from "../_shared";

const h = adminItem(Challenge, {
  fields: FIELDS,
  beforeSave: prepare,
  // Deleting a challenge removes its submissions and takes back the points
  afterDelete: async (doc) => {
    const accepted = await ChallengeSubmission.find({ challenge: doc._id, status: "accepted" }).lean();
    for (const s of accepted) await applyPoints(s.user, -(s.points || 0), { contributions: -1 });
    await ChallengeSubmission.deleteMany({ challenge: doc._id });
  },
});
export const PUT = h.PUT;
export const DELETE = h.DELETE;
