import { connectDB } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api-response";
import { getUserCpStats } from "@/lib/cp";
import { computeBadges } from "@/lib/portfolio";
import mongoose from "mongoose";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import Certificate from "@/models/Certificate";
import ChallengeSubmission from "@/models/ChallengeSubmission";
import Enrollment from "@/models/Enrollment";
import EventRegistration from "@/models/EventRegistration";
import User from "@/models/User";
import Workshop from "@/models/Workshop";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { handle } = await params;

    // Resolve by username first, then by ObjectId for backwards-compat
    const isObjectId = mongoose.isValidObjectId(handle);
    const query = isObjectId
      ? { $or: [{ _id: handle }, { username: handle.toLowerCase() }] }
      : { username: handle.toLowerCase() };

    const user = await User.findOne(query)
      .select(
        "fullName username profileImage department shift rollNumber session createdAt emailVerified " +
          "headline bio skills github linkedin facebook website handles badges points showCertificates"
      )
      .lean();
    if (!user) return fail("Member not found", 404);

    const [projects, blogs, enrollments, certificates, challengesSolved, eventsAttended, cpStats] = await Promise.all([
      Project.find({ owner: user._id, status: "approved" })
        .sort({ createdAt: -1 }).select("-comments").lean(),
      Blog.find({ submittedBy: user._id, status: "approved" })
        .sort({ createdAt: -1 }).select("title subtitle slug image createdAt likeCount commentCount views").lean(),
      Enrollment.find({ user: user._id }).populate({
        path: "workshop",
        select: "title slug thumbnail category level",
        model: Workshop,
      }).lean(),
      // Only certificates the member chose to show (verification by number is unaffected)
      user.showCertificates === false
        ? []
        : Certificate.find({ user: user._id, hiddenOnProfile: { $ne: true } }).sort({ issuedAt: -1 }).select("number type referenceTitle issuedAt instructor").lean(),
      ChallengeSubmission.countDocuments({ user: user._id, status: "accepted" }),
      EventRegistration.countDocuments({ user: user._id, status: "attended" }),
      getUserCpStats(user).catch(() => ({})),
    ]);

    const strip = (s) => s && { rating: s.rating, maxRating: s.maxRating, rank: s.rank, solved: s.solved, contests: s.contests, ok: s.ok, displayHandle: s.displayHandle, fetchedAt: s.fetchedAt };
    const stats = Object.fromEntries(Object.entries(cpStats).map(([k, v]) => [k, strip(v)]));

    delete user.showCertificates;
    return ok({
      member: user,
      projects: projects.map((p) => ({ ...p, likeCount: (p.likes || []).length, likes: undefined })),
      blogs,
      enrollments: enrollments.filter((e) => e.workshop),
      certificates,
      cp: stats,
      badges: computeBadges({ user, stats, blogs: blogs.length, certificates: certificates.length, challengesSolved, eventsAttended }),
      stats: {
        count: projects.length,
        totalLikes: projects.reduce((a, p) => a + (p.likes || []).length, 0),
        blogs: blogs.length,
        enrollments: enrollments.length,
        solved: stats.codeforces?.solved ?? null,
        points: user.points || 0,
        challengesSolved,
        eventsAttended,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
