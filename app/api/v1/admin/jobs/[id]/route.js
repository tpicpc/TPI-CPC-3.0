import { adminItem } from "@/lib/crud";
import JobPost from "@/models/JobPost";
import { FIELDS, prepare } from "../_shared";

const h = adminItem(JobPost, { fields: FIELDS, beforeSave: prepare });
export const PUT = h.PUT;
export const DELETE = h.DELETE;
