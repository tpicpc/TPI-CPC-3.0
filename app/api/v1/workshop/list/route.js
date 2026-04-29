import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Workshop from "@/models/Workshop";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");

    let filter = {};
    if (status === "Public") {
      // Default for the public site — both Published and ComingSoon
      filter = { status: { $in: ["Published", "ComingSoon"] } };
    } else if (status) {
      filter = { status };
    }

    const workshops = await Workshop.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .select("-lessons.description -lessons.resources")
      .lean();
    return ok({ workshops });
  } catch (e) {
    return serverError(e);
  }
}
