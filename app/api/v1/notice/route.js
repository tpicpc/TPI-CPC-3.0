import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Notice from "@/models/Notice";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const data = await req.json();
    if (!data.message) return fail("message required", 400);
    const notice = await Notice.create({
      message: data.message,
      link: data.link || "",
      isActive: data.isActive !== false,
      priority: Number(data.priority || 0),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    });
    return ok({ notice }, "Notice created");
  } catch (e) {
    return serverError(e);
  }
}
