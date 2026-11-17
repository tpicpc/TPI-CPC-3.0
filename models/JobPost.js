import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    kind: { type: String, enum: ["Internship", "Full-time", "Part-time", "Contract", "Remote"], default: "Internship", index: true },
    // Which board tab it belongs to (optional; older posts default to software/CSE)
    category: { type: String, enum: ["swe", "diploma", "govt", "other"], default: "swe" },
    location: { type: String, default: "" },
    description: { type: String, default: "" },
    applyUrl: { type: String, default: "" },
    salary: { type: String, default: "" },
    deadline: { type: Date, default: null },
    tags: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected", "closed"], default: "approved", index: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    submitterName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.JobPost || mongoose.model("JobPost", jobPostSchema);
