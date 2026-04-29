import { connectDB } from "@/lib/db";
import { ok, fail, serverError } from "@/lib/api-response";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { isValidUsername } from "@/lib/validators";
import User from "@/models/User";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("username") || "").toLowerCase().trim();

    if (!username) return fail("username required", 400);
    if (!isValidUsername(username)) {
      return ok({ available: false, valid: false, reason: "Use 3–24 lowercase letters, numbers, or underscores" });
    }

    await connectDB();

    // Exclude the requesting user (so their current username shows as available to themselves)
    let selfId = null;
    const token = getTokenFromRequest(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload?.id) selfId = payload.id;
    }

    const filter = selfId ? { username, _id: { $ne: selfId } } : { username };
    const exists = await User.findOne(filter).select("_id").lean();
    return ok({ available: !exists, valid: true });
  } catch (e) {
    return serverError(e);
  }
}
