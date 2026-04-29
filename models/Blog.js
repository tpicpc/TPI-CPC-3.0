import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: String, default: "TPI CPC" },
    tags: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved", index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
