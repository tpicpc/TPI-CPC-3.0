import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { ok, serverError } from "@/lib/api-response";
import Certificate from "@/models/Certificate";

export async function GET(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const certs = await Certificate.find({ user: auth.user.id }).sort({ issuedAt: -1 }).lean();
    return ok({ certificates: certs });
  } catch (e) {
    return serverError(e);
  }
}
