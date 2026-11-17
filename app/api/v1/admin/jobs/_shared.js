export const FIELDS = ["title", "company", "kind", "location", "description", "applyUrl", "salary", "deadline", "tags", "status"];
export function prepare(d) {
  if (d.deadline === "") d.deadline = null;
  if (typeof d.tags === "string") d.tags = d.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8);
  return d;
}
