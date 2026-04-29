import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    position: { type: String, required: true },
    memberProfile: { type: String, default: "" },
    gender: { type: String, enum: ["male", "female", "other", ""], default: "" },
    year: { type: Number, required: true, index: true },
    bio: { type: String, default: "" },
    email: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    rollNumber: { type: String, default: "" },
    department: { type: String, default: "" },
    shift: { type: String, default: "" },
    session: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", teamSchema);
