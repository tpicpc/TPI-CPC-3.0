import { fail, ok, withAuth } from "@/lib/crud";
import { registrationState } from "@/lib/events";
import { notify } from "@/lib/notify";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";
import User from "@/models/User";

// Member: register for an event (idempotent; re-activates a cancelled registration)
export const POST = withAuth("user", async (_req, { params }, me) => {
  const { id } = await params;
  const event = await Event.findById(id).lean();
  if (!event) return fail("Event not found", 404);
  const existing = await EventRegistration.findOne({ event: id, user: me.id });
  if (existing && existing.status !== "cancelled") return ok({ registration: existing }, "You're already registered");

  const count = await EventRegistration.countDocuments({ event: id, status: { $ne: "cancelled" } });
  const state = registrationState(event, count);
  if (!state.open) return fail(state.reason, 400);

  const user = await User.findById(me.id).select("fullName email rollNumber department status").lean();
  if (!user) return fail("User not found", 404);
  if (user.status && user.status !== "active") return fail("Your account can't register for events right now", 403);

  let registration;
  if (existing) {
    existing.status = "registered";
    registration = await existing.save();
  } else {
    registration = await EventRegistration.create({
      event: id,
      user: me.id,
      name: user.fullName,
      email: user.email,
      rollNumber: user.rollNumber || "",
      department: user.department || "",
    });
  }
  await notify(me.id, {
    title: `You're registered: ${event.title}`,
    body: "Your check-in QR code is in Dashboard → My events. Show it at the entrance.",
    link: "/dashboard/events",
    kind: "event",
  }).catch(() => {});
  return ok({ registration }, "Registered! Your QR pass is ready.");
});

// Member: cancel own registration (not after attendance is marked)
export const DELETE = withAuth("user", async (_req, { params }, me) => {
  const { id } = await params;
  const reg = await EventRegistration.findOne({ event: id, user: me.id });
  if (!reg) return fail("Registration not found", 404);
  if (reg.status === "attended") return fail("Attendance already recorded", 400);
  reg.status = "cancelled";
  await reg.save();
  return ok({}, "Registration cancelled");
});
