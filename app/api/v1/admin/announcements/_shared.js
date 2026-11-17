import { emailAnnouncement, emailConfigured, notify } from "@/lib/notify";
import Announcement from "@/models/Announcement";

export const FIELDS = ["title", "body", "category", "link", "pinned", "published"];

/** Fan out an announcement as in-site notifications (+ email when configured). */
export async function broadcast(doc, { email }) {
  if (!doc.published) return { notified: 0, emailed: 0, emailSkipped: false };
  const notified = await notify("all", {
    title: doc.title,
    body: (doc.body || "").slice(0, 160),
    link: doc.link && doc.link.startsWith("/") ? doc.link : "/notices",
    kind: "notice",
  });
  let emailed = 0;
  const emailSkipped = !!email && !emailConfigured();
  if (email && !emailSkipped) emailed = await emailAnnouncement(doc);
  await Announcement.updateOne({ _id: doc._id }, { notifiedAt: new Date(), $inc: { emailedCount: emailed } });
  return { notified, emailed, emailSkipped };
}
