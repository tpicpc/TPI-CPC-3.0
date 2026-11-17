import { fail, ok, withDB } from "@/lib/crud";
import { authError, requireAuth } from "@/lib/auth";
import Alumni from "@/models/Alumni";

export const dynamic = "force-dynamic";

export const GET = withDB(async () => {
  const alumni = await Alumni.find({ status: "approved" }).sort({ featured: -1, batch: -1, name: 1 }).select("-user -status").lean();
  return ok({ alumni });
});

// Member: submit an alumni profile (own or a senior's) for admin approval
export const POST = withDB(async (req) => {
  const auth = requireAuth(req, "user");
  if (auth.error) return authError(auth.error, auth.status);
  const b = await req.json();
  const s = (v, n = 160) => String(v || "").trim().slice(0, n);
  if (!s(b.name) || !s(b.company)) return fail("Name and company are required", 400);
  const pending = await Alumni.countDocuments({ user: auth.user.id, status: "pending" });
  if (pending >= 3) return fail("You already have submissions waiting for review", 429);
  const doc = await Alumni.create({
    name: s(b.name, 80), company: s(b.company, 80), position: s(b.position, 80), location: s(b.location, 80),
    batch: s(b.batch, 20), department: s(b.department, 60), linkedin: s(b.linkedin, 300), quote: s(b.quote, 280),
    photo: s(b.photo, 500), user: auth.user.id, status: "pending",
  });
  return ok({ alumni: doc }, "Thanks! An admin will review it shortly.");
});
