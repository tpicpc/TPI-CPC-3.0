import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { sendEventAnnouncementEmail } from "@/lib/mailer";
import Event from "@/models/Event";
import User from "@/models/User";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const event = await Event.findById(id).lean();
    if (!event) return fail("Event not found", 404);

    // Optional: ?onlyVerified=1 — default true. Exclude banned/suspended.
    const url = new URL(req.url);
    const onlyVerified = url.searchParams.get("onlyVerified") !== "0";

    // Exclude banned/suspended; include users without a status field (legacy)
    const query = { status: { $nin: ["banned", "suspended"] } };
    if (onlyVerified) query.emailVerified = true;

    const users = await User.find(query).select("fullName email").lean();
    if (users.length === 0) return fail("No eligible recipients found", 400);

    let sent = 0;
    let failed = 0;
    // Sequential with small concurrency — Gmail limits + Vercel 10s function cap.
    // For larger member lists, consider batching across multiple invocations.
    const tasks = users.map(async (u) => {
      try {
        await sendEventAnnouncementEmail(u.email, u.fullName, event);
        sent++;
      } catch (err) {
        failed++;
        console.warn("Event announcement failed for", u.email, err?.message || err);
      }
    });
    // Run in parallel but don't await indefinitely — Vercel has a 10s cap, so we cap concurrency
    const CHUNK = 8;
    for (let i = 0; i < tasks.length; i += CHUNK) {
      await Promise.allSettled(tasks.slice(i, i + CHUNK));
    }

    return ok(
      { recipients: users.length, sent, failed },
      `Announcement sent to ${sent} member${sent === 1 ? "" : "s"}${failed ? ` (${failed} failed)` : ""}.`
    );
  } catch (e) {
    return serverError(e);
  }
}
