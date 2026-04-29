import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    body: { type: String, required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    accepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true },
    tags: [{ type: String, lowercase: true, trim: true, index: true }],
    asker: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    askerName: { type: String, required: true },
    askerAvatar: { type: String, default: "" },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    answers: [answerSchema],
    status: { type: String, enum: ["open", "closed", "hidden"], default: "open", index: true },
  },
  { timestamps: true }
);

questionSchema.index({ tags: 1, createdAt: -1 });

export default mongoose.models.Question || mongoose.model("Question", questionSchema);
