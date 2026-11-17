import mongoose from "mongoose";

const learningProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: "LearningTopic", required: true },
    done: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  { timestamps: true }
);
learningProgressSchema.index({ user: 1, topic: 1 }, { unique: true });

export default mongoose.models.LearningProgress || mongoose.model("LearningProgress", learningProgressSchema);
