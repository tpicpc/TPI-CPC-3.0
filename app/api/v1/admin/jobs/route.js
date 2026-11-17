import { adminCollection } from "@/lib/crud";
import JobPost from "@/models/JobPost";
import User from "@/models/User";
import { FIELDS, prepare } from "./_shared";

const h = adminCollection(JobPost, {
  key: "jobs", fields: FIELDS, sort: { status: 1, createdAt: -1 }, beforeSave: prepare,
  populate: { path: "postedBy", model: User, select: "fullName username" },
});
export const GET = h.GET;
export const POST = h.POST;
