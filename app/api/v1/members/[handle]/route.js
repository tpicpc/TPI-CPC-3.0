import { connectDB } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api-response";
import mongoose from "mongoose";
import Project from "@/models/Project";
import Blog from "@/models/Blog";
import Enrollment from "@/models/Enrollment";
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
      .select("fullName username profileImage department shift rollNumber session createdAt emailVerified")
      .lean();
    if (!user) return fail("Member not found", 404);

    const [projects, blogs, enrollments] = await Promise.all([
      Project.find({ owner: user._id, status: "approved" })
        .sort({ createdAt: -1 }).select("-comments").lean(),
      Blog.find({ submittedBy: user._id, status: "approved" })
        .sort({ createdAt: -1 }).select("title image createdAt").lean(),
      Enrollment.find({ user: user._id }).populate({
        path: "workshop",
        select: "title slug thumbnail category level",
      }).lean(),
    ]);

    return ok({
      member: user,
      projects: projects.map((p) => ({ ...p, likeCount: (p.likes || []).length, likes: undefined })),
      blogs,
      enrollments: enrollments.filter((e) => e.workshop),
      stats: {
        count: projects.length,
        totalLikes: projects.reduce((a, p) => a + (p.likes || []).length, 0),
        blogs: blogs.length,
        enrollments: enrollments.length,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
