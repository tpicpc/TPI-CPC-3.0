import mongoose from "mongoose";

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, default: "" },
    link: { type: String, default: "" },
    note: { type: String, default: "" },
    // "attempted" = tried auto-verify but no accepted submission was found yet
    status: { type: String, enum: ["pending", "accepted", "rejected", "attempted"], default: "pending", index: true },
    method: { type: String, enum: ["auto", "manual"], default: "manual" },
    points: { type: Number, default: 0 },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },
    // Submission history shown to the member on the challenge page
    attempts: [
      {
        at: { type: Date, default: Date.now },
        method: { type: String, enum: ["auto", "manual", "review"], default: "manual" },
        result: { type: String, enum: ["accepted", "pending", "rejected", "failed"], default: "pending" },
        link: { type: String, default: "" },
        message: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);
challengeSubmissionSchema.index({ challenge: 1, user: 1 }, { unique: true });

export default mongoose.models.ChallengeSubmission || mongoose.model("ChallengeSubmission", challengeSubmissionSchema);
