import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectDB();
    const events = await Event.find().sort({ createdAt: -1 }).lean();
    return ok({ events });
  } catch (e) {
    return serverError(e);
  }
}
