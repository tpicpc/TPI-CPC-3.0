import { adminCollection } from "@/lib/crud";
import Alumni from "@/models/Alumni";

const FIELDS = ["name", "photo", "company", "position", "location", "batch", "department", "linkedin", "quote", "status", "featured"];
const h = adminCollection(Alumni, { key: "alumni", fields: FIELDS, sort: { status: 1, createdAt: -1 } });
export const GET = h.GET;
export const POST = h.POST;
