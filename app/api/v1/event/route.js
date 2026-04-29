import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Event from "@/models/Event";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const required = ["title", "location", "description", "eventType", "organizer", "startTime", "status"];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) return fail("Missing fields: " + missing.join(", "), 400);

    let eventImage = data.eventImage || "";
    const file = formData.get("eventImage");
    if (file && typeof file !== "string") {
      eventImage = await uploadFormFileToImgBB(file);
    }
    if (!eventImage) return fail("Event image required", 400);

    const event = await Event.create({
      title: data.title,
      location: data.location,
      description: data.description,
      eventType: data.eventType,
      organizer: data.organizer,
      collaboration: data.collaboration || "",
      startTime: data.startTime,
      endTime: data.endTime || "",
      status: data.status,
      eventImage,
    });
    return ok({ event }, "Event created");
  } catch (e) {
    return serverError(e);
  }
}
