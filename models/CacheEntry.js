import mongoose from "mongoose";

// Small key/value cache shared across serverless instances (e.g. the upcoming-contests list).
const cacheEntrySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: mongoose.Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.CacheEntry || mongoose.model("CacheEntry", cacheEntrySchema);
