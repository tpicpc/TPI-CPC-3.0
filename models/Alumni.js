import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, default: "" },
    company: { type: String, required: true },
    position: { type: String, default: "" },
    location: { type: String, default: "" },
    batch: { type: String, default: "" },
    department: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    quote: { type: String, default: "" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved", index: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Alumni || mongoose.model("Alumni", alumniSchema);
