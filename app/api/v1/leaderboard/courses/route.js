import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    await connectDB();

    const rows = await Enrollment.aggregate([
      {
        $group: {
          _id: "$user",
          enrollmentCount: { $sum: 1 },
          completedLessons: {
            $sum: {
              $cond: [
                { $isArray: "$completedLessons" },
                { $size: "$completedLessons" },
                0,
              ],
            },
          },
          firstEnrolledAt: { $min: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          enrollmentCount: 1,
          completedLessons: 1,
          firstEnrolledAt: 1,
          score: { $add: ["$enrollmentCount", "$completedLessons"] },
          name: "$user.fullName",
          email: "$user.email",
          department: "$user.department",
          shift: "$user.shift",
          rollNumber: "$user.rollNumber",
          profileImage: "$user.profileImage",
          gender: { $literal: "" },
        },
      },
      { $sort: { score: -1, enrollmentCount: -1, firstEnrolledAt: 1 } },
      { $limit: 100 },
    ]);

    return ok({ entries: rows });
  } catch (e) {
    return serverError(e);
  }
}
