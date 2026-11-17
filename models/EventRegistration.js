import mongoose from "mongoose";
import crypto from "node:crypto";

// 8-char, unambiguous check-in code (also encoded in the attendee's QR).
export function genCheckinCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(8);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, default: "" },
    rollNumber: { type: String, default: "" },
    department: { type: String, default: "" },
    code: { type: String, unique: true, default: genCheckinCode },
    status: { type: String, enum: ["registered", "attended", "cancelled"], default: "registered", index: true },
    attendedAt: { type: Date, default: null },
    certificateNumber: { type: String, default: "" },
  },
  { timestamps: true }
);
eventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.models.EventRegistration || mongoose.model("EventRegistration", eventRegistrationSchema);
