import { adminCollection } from "@/lib/crud";
import LearningTopic from "@/models/LearningTopic";
import { FIELDS, prepareTopic } from "./_shared";

const h = adminCollection(LearningTopic, { key: "topics", fields: FIELDS, sort: { level: 1, order: 1 }, beforeSave: (d) => prepareTopic(d) });
export const GET = h.GET;
export const POST = h.POST;
