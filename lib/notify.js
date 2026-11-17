// In-site notifications (+ optional email) helpers.
import { sendAnnouncementEmail } from "@/lib/mailer";
import Notification from "@/models/Notification";
import User from "@/models/User";

export const emailConfigured = () => !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

/** Create a notification for one or many users. `users` = id | id[] | "all". */
export async function notify(users, { title, body = "", link = "", kind = "general" }) {
  let ids = users;
  if (users === "all") ids = (await User.find({}).select("_id").lean()).map((u) => u._id);
  if (!Array.isArray(ids)) ids = [ids];
  if (!ids.length) return 0;
  await Notification.insertMany(ids.map((user) => ({ user, title, body, link, kind })), { ordered: false });
  return ids.length;
}

/**
 * Email an announcement to verified members who haven't opted out.
 * Skipped entirely (returns 0) when EMAIL_USER / EMAIL_PASS are not configured.
 */
export async function emailAnnouncement(announcement) {
  if (!emailConfigured()) return 0;
  const users = await User.find({ emailVerified: true, emailNotifications: { $ne: false } }).select("email fullName").lean();
  let sent = 0;
  // small batches to stay friendly with Gmail's rate limits
  for (let i = 0; i < users.length; i += 10) {
    const batch = users.slice(i, i + 10);
    const res = await Promise.allSettled(batch.map((u) => sendAnnouncementEmail(u.email, u.fullName, announcement)));
    sent += res.filter((r) => r.status === "fulfilled").length;
  }
  return sent;
}
