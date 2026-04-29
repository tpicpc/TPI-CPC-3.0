import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "" },
    fileSize: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    category: { type: String, required: true, index: true },
    tags: [{ type: String, lowercase: true, trim: true }],
    downloads: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Resource || mongoose.model("Resource", resourceSchema);
