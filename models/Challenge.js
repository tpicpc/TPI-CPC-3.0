import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    // Optional problem-statement panel (shown on the challenge page; the judge link stays the source of truth)
    statement: { type: String, default: "" },
    sampleInput: { type: String, default: "" },
    sampleOutput: { type: String, default: "" },
    tags: [{ type: String }],
    kind: { type: String, enum: ["daily", "weekly"], default: "weekly", index: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
    points: { type: Number, default: 10 },
    platform: { type: String, enum: ["codeforces", "codechef", "atcoder", "other"], default: "codeforces" },
    problemUrl: { type: String, default: "" },
    // Codeforces problem id, enables automatic verification of accepted submissions
    cfContestId: { type: Number, default: null },
    cfIndex: { type: String, default: "" },
    startsAt: { type: Date, default: Date.now, index: true },
    endsAt: { type: Date, default: null },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Challenge || mongoose.model("Challenge", challengeSchema);
