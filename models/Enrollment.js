import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    workshop: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", required: true, index: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: String }],
  },
  { timestamps: true }
);

enrollmentSchema.index({ user: 1, workshop: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
