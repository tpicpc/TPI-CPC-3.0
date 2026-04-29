import mongoose from "mongoose";

const advisorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    advisorProfile: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Advisor || mongoose.model("Advisor", advisorSchema);
