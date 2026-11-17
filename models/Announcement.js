import mongoose from "mongoose";

// Notice-board post (separate from the scrolling Notice bar).
const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, default: "" },
    category: { type: String, enum: ["General", "Event", "Contest", "Workshop", "Urgent"], default: "General", index: true },
    link: { type: String, default: "" },
    pinned: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    notifiedAt: { type: Date, default: null },
    emailedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
