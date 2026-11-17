// Event registration / attendance / certificate helpers.
import Certificate from "@/models/Certificate";
import EventRegistration from "@/models/EventRegistration";

const TZ = "+06:00"; // event times are entered as Bangladesh local datetime-local strings

export function parseEventTime(s) {
  if (!s) return null;
  const str = String(s);
  const d = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(str) ? str : `${str.length === 16 ? `${str}:00` : str}${TZ}`);
  return isNaN(d) ? null : d;
}

export function eventStart(ev) {
  return parseEventTime(ev.startTime);
}

export function eventEnd(ev) {
  const end = parseEventTime(ev.endTime);
  if (end) return end;
  const start = eventStart(ev);
  return start ? new Date(start.getTime() + 3 * 3600 * 1000) : null;
}

export function eventEnded(ev) {
  if (ev.status === "Completed") return true;
  const end = eventEnd(ev);
  return !!end && end.getTime() < Date.now();
}

export function registrationState(ev, registeredCount = 0) {
  if (!ev.registrationEnabled) return { open: false, reason: "Registration is not open for this event" };
  if (eventEnded(ev)) return { open: false, reason: "This event has ended" };
  if (ev.registrationDeadline && new Date(ev.registrationDeadline).getTime() < Date.now())
    return { open: false, reason: "Registration deadline has passed" };
  if (ev.capacity > 0 && registeredCount >= ev.capacity) return { open: false, reason: "All seats are filled", full: true };
  return { open: true };
}

export const QR_PREFIX = "TPICPC-CHECKIN:";

/** Issue (or fetch) the participation certificate for an attended registration. */
export async function issueEventCertificate(reg, ev, issuedBy = null) {
  if (reg.status !== "attended" || ev.certificatesEnabled === false || !eventEnded(ev)) return null;
  let cert = await Certificate.findOne({ user: reg.user, type: "event", referenceId: ev._id }).lean();
  if (!cert) {
    try {
      cert = (
        await Certificate.create({
          user: reg.user,
          recipientName: reg.name,
          type: "event",
          referenceId: ev._id,
          referenceTitle: ev.title,
          instructor: ev.organizer || "",
          grade: "Participation",
          ...(issuedBy ? { issuedBy } : {}),
        })
      ).toObject();
    } catch (e) {
      if (e.code !== 11000) throw e;
      cert = await Certificate.findOne({ user: reg.user, type: "event", referenceId: ev._id }).lean();
    }
  }
  if (cert && reg.certificateNumber !== cert.number) {
    await EventRegistration.updateOne({ _id: reg._id }, { certificateNumber: cert.number });
  }
  return cert;
}
