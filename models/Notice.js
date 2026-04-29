import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    link: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
