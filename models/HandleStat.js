import mongoose from "mongoose";

// Cached competitive-programming stats for a handle on a platform (refreshed periodically).
const handleStatSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: ["codeforces", "codechef", "atcoder"], required: true },
    handle: { type: String, required: true, lowercase: true, trim: true },
    displayHandle: { type: String, default: "" },
    rating: { type: Number, default: null },
    maxRating: { type: Number, default: null },
    rank: { type: String, default: "" },
    solved: { type: Number, default: null },
    contests: { type: Number, default: null },
    ok: { type: Boolean, default: true },
    error: { type: String, default: "" },
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
handleStatSchema.index({ platform: 1, handle: 1 }, { unique: true });

export default mongoose.models.HandleStat || mongoose.model("HandleStat", handleStatSchema);
