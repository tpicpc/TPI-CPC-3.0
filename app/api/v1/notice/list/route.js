import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import Notice from "@/models/Notice";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const activeOnly = url.searchParams.get("active") === "true";
    const filter = activeOnly
      ? { isActive: true, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
      : {};
    const notices = await Notice.find(filter).sort({ priority: -1, createdAt: -1 }).lean();
    return ok({ notices });
  } catch (e) {
    return serverError(e);
  }
}
