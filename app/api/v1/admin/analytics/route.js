import { ok, withAuth } from "@/lib/crud";
import Blog from "@/models/Blog";
import Challenge from "@/models/Challenge";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";
import User from "@/models/User";

export const dynamic = "force-dynamic";

function monthKeys(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`, label: x.toLocaleString("en-US", { month: "short", year: "2-digit" }) });
  }
  return out;
}

export const GET = withAuth("admin", async (req) => {
  const months = Math.min(24, Math.max(3, Number(new URL(req.url).searchParams.get("months")) || 12));
  const keys = monthKeys(months);
  const since = new Date(`${keys[0].key}-01T00:00:00+06:00`);
  const tz = "+06:00";

  const [signups, totalUsers, usersBefore, topBlogs, totalViews, attendance, participation, subsByMonth, totals] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: tz } }, n: { $sum: 1 } } },
    ]),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $lt: since } }),
    Blog.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(8).select("title slug views likeCount commentCount").lean(),
    Blog.aggregate([{ $group: { _id: null, v: { $sum: "$views" } } }]),
    EventRegistration.aggregate([
      { $group: { _id: "$event", registered: { $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0] } }, attended: { $sum: { $cond: [{ $eq: ["$status", "attended"] }, 1, 0] } } } },
      { $lookup: { from: "events", localField: "_id", foreignField: "_id", as: "e" } },
      { $unwind: "$e" },
      { $project: { title: "$e.title", startTime: "$e.startTime", registered: 1, attended: 1 } },
      { $sort: { startTime: -1 } },
      { $limit: 8 },
    ]),
    ChallengeSubmission.aggregate([
      { $group: { _id: "$challenge", submissions: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } } } },
      { $lookup: { from: "challenges", localField: "_id", foreignField: "_id", as: "c" } },
      { $unwind: "$c" },
      { $project: { title: "$c.title", startsAt: "$c.startsAt", submissions: 1, accepted: 1 } },
      { $sort: { startsAt: -1 } },
      { $limit: 10 },
    ]),
    ChallengeSubmission.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: tz } }, n: { $sum: 1 }, members: { $addToSet: "$user" } } },
    ]),
    Promise.all([
      EventRegistration.countDocuments({ status: { $ne: "cancelled" } }),
      EventRegistration.countDocuments({ status: "attended" }),
      ChallengeSubmission.countDocuments({ status: "accepted" }),
      ChallengeSubmission.distinct("user"),
      Challenge.countDocuments(),
      Event.countDocuments(),
    ]),
  ]);

  const sMap = Object.fromEntries(signups.map((s) => [s._id, s.n]));
  let running = usersBefore;
  const growth = keys.map((k) => {
    running += sMap[k.key] || 0;
    return { month: k.label, newMembers: sMap[k.key] || 0, total: running };
  });
  const pMap = Object.fromEntries(subsByMonth.map((s) => [s._id, s]));
  const participationByMonth = keys.map((k) => ({ month: k.label, submissions: pMap[k.key]?.n || 0, members: pMap[k.key]?.members.length || 0 }));
  const [registered, attended, accepted, participants, challenges, events] = totals;

  return ok({
    kpis: {
      totalUsers,
      newThisMonth: growth[growth.length - 1].newMembers,
      totalViews: totalViews[0]?.v || 0,
      registered,
      attended,
      attendanceRate: registered ? Math.round((attended / registered) * 100) : 0,
      challengeParticipants: participants.length,
      acceptedSolutions: accepted,
      challenges,
      events,
    },
    growth,
    topBlogs: topBlogs.map((b) => ({ ...b, short: b.title.length > 28 ? `${b.title.slice(0, 27)}…` : b.title })),
    attendance: attendance.reverse().map((a) => ({ ...a, short: a.title.length > 18 ? `${a.title.slice(0, 17)}…` : a.title })),
    participation: participation.reverse().map((p) => ({ ...p, short: p.title.length > 20 ? `${p.title.slice(0, 19)}…` : p.title })),
    participationByMonth,
  });
});
