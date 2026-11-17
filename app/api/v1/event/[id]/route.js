import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";
import { eventEnded, registrationState } from "@/lib/events";
import mongoose from "mongoose";

// Public: single event with registration info (+ the viewer's registration when logged in)
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return fail("Event not found", 404);
    const event = await Event.findById(id).lean();
    if (!event) return fail("Event not found", 404);
    const registeredCount = await EventRegistration.countDocuments({ event: id, status: { $ne: "cancelled" } });
    const auth = requireAuth(req, "user");
    const myRegistration = auth.error
      ? null
      : await EventRegistration.findOne({ event: id, user: auth.user.id }).select("code status attendedAt certificateNumber createdAt").lean();
    return ok({
      event,
      registration: { ...registrationState(event, registeredCount), registeredCount, ended: eventEnded(event) },
      myRegistration,
    });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const updates = {};
    for (const k of ["title", "location", "description", "eventType", "organizer", "collaboration", "startTime", "endTime", "status"]) {
      if (data[k] !== undefined) updates[k] = data[k];
    }
    const file = formData.get("eventImage");
    if (file && typeof file !== "string") {
      updates.eventImage = await uploadFormFileToImgBB(file);
    }

    const event = await Event.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!event) return fail("Event not found", 404);
    return ok({ event }, "Event updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const deleted = await Event.findByIdAndDelete(id);
    if (!deleted) return fail("Event not found", 404);
    return ok({}, "Event deleted");
  } catch (e) {
    return serverError(e);
  }
}
