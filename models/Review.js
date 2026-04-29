import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    semester: { type: String, required: true },
    shift: { type: String, required: true },
    reviewMessage: { type: String, required: true },
    department: { type: String, required: true },
    profileImage: { type: String, default: "" },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
