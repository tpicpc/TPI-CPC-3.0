import mongoose from "mongoose";

// Comments on blog posts live in their own collection so posts stay small and
// comments can be listed/moderated across all posts from the admin panel.
const blogCommentSchema = new mongoose.Schema(
  {
    blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    username: { type: String, default: "" },
    avatar: { type: String, default: "" },
    text: { type: String, required: true, maxlength: 1000 },
    // Stored for moderation only. Excluded from queries by default and never returned publicly.
    ip: { type: String, default: "", select: false },
    userAgent: { type: String, default: "", select: false },
  },
  { timestamps: true }
);

blogCommentSchema.index({ blog: 1, createdAt: -1 });
blogCommentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.BlogComment || mongoose.model("BlogComment", blogCommentSchema);
