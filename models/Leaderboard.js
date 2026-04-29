import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    department: { type: String, default: "" },
    rollNumber: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    points: { type: Number, default: 0, index: true },
    contributions: { type: Number, default: 0 },
    contestsWon: { type: Number, default: 0 },
    badge: { type: String, default: "" },
    handle: { type: String, default: "" },
    year: { type: Number, default: () => new Date().getFullYear(), index: true },
  },
  { timestamps: true }
);

leaderboardSchema.index({ year: 1, points: -1 });

export default mongoose.models.Leaderboard || mongoose.model("Leaderboard", leaderboardSchema);
