import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    eventType: { type: String, required: true },
    organizer: { type: String, required: true },
    collaboration: { type: String, default: "" },
    startTime: { type: String, required: true },
    endTime: { type: String, default: "" },
    status: { type: String, required: true, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
    eventImage: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
