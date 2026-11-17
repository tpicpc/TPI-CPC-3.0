import { adminCollection } from "@/lib/crud";
import { notify } from "@/lib/notify";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import { FIELDS, prepare } from "./_shared";

const h = adminCollection(Challenge, {
  key: "challenges",
  fields: FIELDS,
  sort: { startsAt: -1 },
  beforeSave: prepare,
  afterCreate: async (doc, { body }) => {
    if (body.notify && doc.published) {
      await notify("all", {
        title: `New ${doc.kind} challenge: ${doc.title}`,
        body: `${doc.difficulty} · ${doc.points} points`,
        link: `/challenges/${doc._id}`,
        kind: "challenge",
      }).catch(() => {});
    }
    return {};
  },
});

// Include pending/accepted counts per challenge
export async function GET(req, ctx) {
  const res = await h.GET(req, ctx);
  if (res.status !== 200) return res;
  const body = await res.json();
  const counts = await ChallengeSubmission.aggregate([{ $group: { _id: { c: "$challenge", s: "$status" }, n: { $sum: 1 } } }]);
  const map = {};
  for (const r of counts) (map[String(r._id.c)] ||= {})[r._id.s] = r.n;
  body.challenges = body.challenges.map((c) => ({ ...c, counts: map[String(c._id)] || {} }));
  return Response.json(body);
}
export const POST = h.POST;
