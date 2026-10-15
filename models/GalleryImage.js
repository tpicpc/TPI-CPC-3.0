import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    thumbUrl: { type: String, default: "" },
    mediumUrl: { type: String, default: "" },
    deleteUrl: { type: String, default: "" },
    imgbbId: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    title: { type: String, default: "", trim: true },
    caption: { type: String, default: "", trim: true },
    category: { type: String, default: "", trim: true, index: true },
  },
  { timestamps: true }
);

galleryImageSchema.index({ createdAt: -1 });

export default mongoose.models.GalleryImage || mongoose.model("GalleryImage", galleryImageSchema);
