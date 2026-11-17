import { fail, ok, withAuth } from "@/lib/crud";
import EventRegistration from "@/models/EventRegistration";

// Admin: set a registration's status manually (attended / registered / cancelled)
export const PATCH = withAuth("admin", async (req, { params }) => {
  const { id, regId } = await params;
  const { status } = await req.json();
  if (!["registered", "attended", "cancelled"].includes(status)) return fail("Invalid status", 400);
  const reg = await EventRegistration.findOneAndUpdate(
    { _id: regId, event: id },
    { status, attendedAt: status === "attended" ? new Date() : null },
    { new: true }
  ).lean();
  if (!reg) return fail("Registration not found", 404);
  return ok({ registration: reg }, "Updated");
});
