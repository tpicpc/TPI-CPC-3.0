import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

contactMessageSchema.index({ createdAt: -1 });

export default mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", contactMessageSchema);
