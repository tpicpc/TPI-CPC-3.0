import { adminItem } from "@/lib/crud";
import Alumni from "@/models/Alumni";

const FIELDS = ["name", "photo", "company", "position", "location", "batch", "department", "linkedin", "quote", "status", "featured"];
const h = adminItem(Alumni, { fields: FIELDS });
export const PUT = h.PUT;
export const DELETE = h.DELETE;
