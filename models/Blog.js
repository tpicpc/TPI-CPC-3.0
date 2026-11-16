import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Optional Medium-style subtitle shown under the title (added later; older posts have none).
    subtitle: { type: String, default: "", maxlength: 300 },
    description: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: String, default: "TPI CPC" },
    tags: [{ type: String }],
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved", index: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
    // Optional pretty URL (/blogs/<slug>); /blogs/<id> keeps working for every post.
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, index: true },
    // Optional SEO overrides; empty values fall back to title / subtitle / excerpt / cover / tags.
    seo: {
      title: { type: String, default: "", maxlength: 120 },
      description: { type: String, default: "", maxlength: 320 },
      keywords: [{ type: String }],
      canonicalUrl: { type: String, default: "" },
      ogImage: { type: String, default: "" },
    },
    // Users who liked the post (one like per signed-in user). Never sent to clients; see likeCount.
    likes: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], default: [], select: false },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
