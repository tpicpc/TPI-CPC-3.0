import { fail, ok, withDB } from "@/lib/crud";
import { authError, requireAuth } from "@/lib/auth";
import JobPost from "@/models/JobPost";

export const dynamic = "force-dynamic";

export const GET = withDB(async () => {
  const jobs = await JobPost.find({
    status: "approved",
    $or: [{ deadline: null }, { deadline: { $gte: new Date(Date.now() - 86400000) } }],
  }).sort({ createdAt: -1 }).select("-postedBy").lean();
  return ok({ jobs });
});

// Member: share an opening — goes live after admin approval
export const POST = withDB(async (req) => {
  const auth = requireAuth(req, "user");
  if (auth.error) return authError(auth.error, auth.status);
  const b = await req.json();
  const s = (v, n = 160) => String(v || "").trim().slice(0, n);
  if (!s(b.title) || !s(b.company)) return fail("Title and company are required", 400);
  if (!/^https?:\/\//i.test(s(b.applyUrl, 500))) return fail("Add a valid link where people can apply", 400);
  const pending = await JobPost.countDocuments({ postedBy: auth.user.id, status: "pending" });
  if (pending >= 5) return fail("You already have several posts waiting for review", 429);
  const kinds = ["Internship", "Full-time", "Part-time", "Contract", "Remote"];
  const doc = await JobPost.create({
    title: s(b.title, 100), company: s(b.company, 80), kind: kinds.includes(b.kind) ? b.kind : "Internship",
    category: ["swe", "diploma", "govt", "other"].includes(b.category) ? b.category : "swe",
    location: s(b.location, 80), description: s(b.description, 2000), applyUrl: s(b.applyUrl, 500), salary: s(b.salary, 60),
    deadline: b.deadline ? new Date(b.deadline) : null,
    tags: (Array.isArray(b.tags) ? b.tags : String(b.tags || "").split(",")).map((t) => s(t, 24)).filter(Boolean).slice(0, 8),
    status: "pending", postedBy: auth.user.id, submitterName: s(b.submitterName, 80),
  });
  return ok({ job: doc }, "Thanks! It will appear once an admin approves it.");
});
