import { fail, ok, withAuth } from "@/lib/crud";
import { eventEnded } from "@/lib/events";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";

// Admin: registrations + attendance stats for one event
export const GET = withAuth("admin", async (_req, { params }) => {
  const { id } = await params;
  const event = await Event.findById(id).lean();
  if (!event) return fail("Event not found", 404);
  const registrations = await EventRegistration.find({ event: id }).sort({ createdAt: -1 }).lean();
  const count = (s) => registrations.filter((r) => r.status === s).length;
  return ok({
    event: { ...event, ended: eventEnded(event) },
    registrations,
    stats: {
      registered: registrations.length - count("cancelled"),
      attended: count("attended"),
      cancelled: count("cancelled"),
      certificates: registrations.filter((r) => r.certificateNumber).length,
    },
  });
});

// Admin: registration settings for the event
export const PATCH = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const updates = {};
  if (body.registrationEnabled !== undefined) updates.registrationEnabled = !!body.registrationEnabled;
  if (body.certificatesEnabled !== undefined) updates.certificatesEnabled = !!body.certificatesEnabled;
  if (body.capacity !== undefined) updates.capacity = Math.max(0, Number(body.capacity) || 0);
  if (body.registrationDeadline !== undefined)
    updates.registrationDeadline = body.registrationDeadline ? new Date(`${body.registrationDeadline}${body.registrationDeadline.length === 16 ? ":00+06:00" : ""}`) : null;
  const event = await Event.findByIdAndUpdate(id, updates, { new: true }).lean();
  if (!event) return fail("Event not found", 404);
  return ok({ event }, "Registration settings saved");
});
