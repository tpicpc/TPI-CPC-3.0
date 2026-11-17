import { adminCollection } from "@/lib/crud";
import Announcement from "@/models/Announcement";
import { broadcast, FIELDS } from "./_shared";

const h = adminCollection(Announcement, {
  key: "announcements",
  fields: FIELDS,
  sort: { pinned: -1, createdAt: -1 },
  afterCreate: async (doc, { body }) => (body.notify ? { broadcast: await broadcast(doc, { email: !!body.email }) } : {}),
});
export const GET = h.GET;
export const POST = h.POST;
