import { adminItem } from "@/lib/crud";
import Announcement from "@/models/Announcement";
import { broadcast, FIELDS } from "../_shared";

const h = adminItem(Announcement, {
  fields: FIELDS,
  afterUpdate: async (doc, _prev, { body }) => (body.notify ? { broadcast: await broadcast(doc, { email: !!body.email }) } : {}),
});
export const PUT = h.PUT;
export const DELETE = h.DELETE;
