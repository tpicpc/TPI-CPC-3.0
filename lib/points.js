// Challenge points → User.points and the (hidden) yearly Leaderboard.
import Leaderboard from "@/models/Leaderboard";
import User from "@/models/User";

export async function applyPoints(userId, delta, { contributions = 0 } = {}) {
  if (!delta && !contributions) return;
  await User.updateOne({ _id: userId }, { $inc: { points: delta } });
  const user = await User.findById(userId).select("fullName department rollNumber profileImage handles username").lean();
  if (!user) return;
  const year = new Date().getFullYear();
  await Leaderboard.findOneAndUpdate(
    { user: userId, year },
    {
      $inc: { points: delta, contributions },
      $set: {
        name: user.fullName,
        department: user.department || "",
        rollNumber: user.rollNumber || "",
        profileImage: user.profileImage || "",
        handle: user.handles?.codeforces || user.username || "",
        source: "challenges",
      },
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
}
