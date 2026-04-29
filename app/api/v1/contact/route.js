import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { authError, requireAuth } from "@/lib/auth";
import { isValidEmail } from "@/lib/validators";
import ContactMessage from "@/models/ContactMessage";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, message } = await req.json();
    if (!name?.trim()) return fail("Name is required", 400);
    if (!isValidEmail(email)) return fail("Valid email is required", 400);
    if (!message?.trim() || message.trim().length < 5) {
      return fail("Message must be at least 5 characters", 400);
    }

    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return ok({ id: doc._id }, "Message received — we'll get back to you soon.");
  } catch (e) {
    return serverError(e);
  }
}

export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter");
    const query = filter === "unread" ? { read: false } : filter === "read" ? { read: true } : {};

    const messages = await ContactMessage.find(query).sort({ createdAt: -1 }).lean();
    const unread = await ContactMessage.countDocuments({ read: false });

    return ok({ messages, unread });
  } catch (e) {
    return serverError(e);
  }
}
