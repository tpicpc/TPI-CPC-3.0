import mongoose from "mongoose";

function genCertNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `TPI-${ts}-${rand}`;
}

const certificateSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true, default: genCertNumber, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientName: { type: String, required: true },
    type: { type: String, enum: ["course", "event"], required: true, index: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    referenceTitle: { type: String, required: true },
    instructor: { type: String, default: "" },
    issuedAt: { type: Date, default: Date.now },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    grade: { type: String, default: "" },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, type: 1, referenceId: 1 }, { unique: true });

export default mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);
