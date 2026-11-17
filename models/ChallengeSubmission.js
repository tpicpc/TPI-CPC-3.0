import mongoose from "mongoose";

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "Challenge", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, default: "" },
    link: { type: String, default: "" },
    note: { type: String, default: "" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending", index: true },
    method: { type: String, enum: ["auto", "manual"], default: "manual" },
    points: { type: Number, default: 0 },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" },
  },
  { timestamps: true }
);
challengeSubmissionSchema.index({ challenge: 1, user: 1 }, { unique: true });

export default mongoose.models.ChallengeSubmission || mongoose.model("ChallengeSubmission", challengeSubmissionSchema);
