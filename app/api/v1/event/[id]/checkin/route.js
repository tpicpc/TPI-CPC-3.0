import { fail, ok, withAuth } from "@/lib/crud";
import { QR_PREFIX } from "@/lib/events";
import EventRegistration from "@/models/EventRegistration";

// Admin: mark attendance from a scanned QR payload or a typed check-in code
export const POST = withAuth("admin", async (req, { params }) => {
  const { id } = await params;
  const { code: raw } = await req.json();
  const code = String(raw || "").trim().replace(QR_PREFIX, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length < 6) return fail("Enter a valid check-in code", 400);
  const reg = await EventRegistration.findOne({ code });
  if (!reg) return fail("No registration found for this code", 404);
  if (String(reg.event) !== String(id)) return fail("This pass belongs to a different event", 409);
  if (reg.status === "cancelled") return fail(`${reg.name}'s registration was cancelled`, 409);
  if (reg.status === "attended") return ok({ registration: reg, already: true }, `${reg.name} is already checked in`);
  reg.status = "attended";
  reg.attendedAt = new Date();
  await reg.save();
  return ok({ registration: reg }, `Checked in: ${reg.name}`);
});
