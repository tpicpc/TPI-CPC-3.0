import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: "" },
  kind: { type: String, enum: ["problem", "article", "video", "course", "practice"], default: "problem" },
  platform: { type: String, default: "" },
  difficulty: { type: String, default: "" },
  note: { type: String, default: "" },
});

// One topic on the Beginner → Advanced learning roadmap, with curated items.
const learningTopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner", index: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    items: [itemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.LearningTopic || mongoose.model("LearningTopic", learningTopicSchema);
