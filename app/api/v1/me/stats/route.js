import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import mongoose from "mongoose";
import Blog from "@/models/Blog";
import Certificate from "@/models/Certificate";
import Enrollment from "@/models/Enrollment";
import Project from "@/models/Project";
import Question from "@/models/Question";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const uid = auth.user.id;
    const oid = new mongoose.Types.ObjectId(uid);

    const [enrollments, projects, blogs, certs, questions] = await Promise.all([
      Enrollment.countDocuments({ user: uid }),
      Project.aggregate([
        { $match: { owner: oid } },
        { $group: { _id: "$status", count: { $sum: 1 }, totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } } } },
      ]),
      Blog.aggregate([
        { $match: { submittedBy: oid } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Certificate.countDocuments({ user: uid }),
      Question.countDocuments({ asker: uid }),
    ]);

    const projectStats = projects.reduce(
      (acc, p) => {
        acc[p._id] = p.count;
        acc.totalLikes += p.totalLikes;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0, totalLikes: 0 }
    );
    const blogStats = blogs.reduce(
      (acc, b) => { acc[b._id] = b.count; return acc; },
      { pending: 0, approved: 0, rejected: 0 }
    );

    return ok({
      stats: {
        enrollments,
        certificates: certs,
        projects: projectStats,
        blogs: blogStats,
        questions,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
