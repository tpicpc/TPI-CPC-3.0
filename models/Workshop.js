import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
    duration: { type: String, default: "" },
    description: { type: String, default: "" },
    resources: [{ label: String, url: String }],
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    thumbnail: { type: String, required: true },
    instructor: { type: String, required: true },
    category: { type: String, default: "General" },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    tags: [{ type: String }],
    playlistUrl: { type: String, default: "" },
    lessons: [lessonSchema],
    status: { type: String, enum: ["Draft", "ComingSoon", "Published"], default: "Draft" },
    releaseDate: { type: Date, default: null },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Workshop || mongoose.model("Workshop", workshopSchema);
