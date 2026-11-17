import { ok, withAuth } from "@/lib/crud";
import { eventEnded, eventStart, issueEventCertificate, QR_PREFIX } from "@/lib/events";
import Event from "@/models/Event";
import EventRegistration from "@/models/EventRegistration";
import QRCode from "qrcode";

// Member: my registrations with QR passes; certificates are issued automatically
// for attended events once the event is over.
export const GET = withAuth("user", async (_req, _ctx, me) => {
  const regs = await EventRegistration.find({ user: me.id, status: { $ne: "cancelled" } })
    .populate({ path: "event", model: Event, select: "title location startTime endTime status eventImage eventType organizer certificatesEnabled" })
    .sort({ createdAt: -1 })
    .lean();

  const out = await Promise.all(
    regs
      .filter((r) => r.event)
      .map(async (r) => {
        let certificateNumber = r.certificateNumber || "";
        if (!certificateNumber && r.status === "attended") {
          const cert = await issueEventCertificate(r, r.event).catch(() => null);
          certificateNumber = cert?.number || "";
        }
        const ended = eventEnded(r.event);
        const qr = ended ? null : await QRCode.toDataURL(`${QR_PREFIX}${r.code}`, { margin: 1, width: 360, color: { dark: "#111827", light: "#ffffff" } });
        return { ...r, certificateNumber, qr, ended, startsAt: eventStart(r.event) };
      })
  );
  out.sort((a, b) => (a.ended - b.ended) || (new Date(a.startsAt) - new Date(b.startsAt)) * (a.ended ? -1 : 1));
  return ok({ registrations: out });
});
