import { fail, ok, withAuth } from "@/lib/crud";
import { eventEnded, issueEventCertificate } from "@/lib/events";
import { notify } from "@/lib/notify";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";

// Admin: issue participation certificates to every attendee (after the event)
export const POST = withAuth("admin", async (_req, { params }, admin) => {
  const { id } = await params;
  const event = await Event.findById(id).lean();
  if (!event) return fail("Event not found", 404);
  if (!eventEnded(event)) return fail("Certificates can be issued once the event has ended (or is marked Completed)", 400);
  if (event.certificatesEnabled === false) return fail("Certificates are disabled for this event", 400);
  const regs = await EventRegistration.find({ event: id, status: "attended" }).lean();
  let issued = 0;
  for (const r of regs) {
    const had = !!r.certificateNumber;
    const cert = await issueEventCertificate(r, event, admin.id);
    if (cert && !had) {
      issued++;
      await notify(r.user, {
        title: `Your certificate for ${event.title} is ready`,
        body: "Download the PDF from Dashboard → My events.",
        link: "/dashboard/events",
        kind: "certificate",
      }).catch(() => {});
    }
  }
  return ok({ issued, attendees: regs.length }, issued ? `Issued ${issued} certificate(s)` : "All attendees already have certificates");
});
