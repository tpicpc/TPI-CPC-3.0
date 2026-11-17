import { adminItem } from "@/lib/crud";
import LearningProgress from "@/models/LearningProgress";
import LearningTopic from "@/models/LearningTopic";
import { FIELDS, prepareTopic } from "../_shared";

const h = adminItem(LearningTopic, {
  fields: FIELDS,
  beforeSave: (d, { id }) => prepareTopic(d, { id }),
  afterDelete: (doc) => LearningProgress.deleteMany({ topic: doc._id }),
});
export const PUT = h.PUT;
export const DELETE = h.DELETE;
