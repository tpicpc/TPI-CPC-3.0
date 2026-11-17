import { fail, ok, withDB } from "@/lib/crud";
import { authError, requireAuth } from "@/lib/auth";
import { sortMembers } from "@/lib/utils";
import Alumni from "@/models/Alumni";
import Team from "@/models/Team";

export const dynamic = "force-dynamic";

const key = (n = "") => String(n).toLowerCase().replace(/^(md\.?|mst\.?|mohammad|muhammad)\s+/, "").replace(/[^a-z\u0980-\u09ff]+/g, " ").trim();

// Public: approved alumni profiles + every committee (current and former) from the team data.
export const GET = withDB(async () => {
  const [alumni, team] = await Promise.all([
    Alumni.find({ status: "approved" }).sort({ featured: -1, batch: -1, name: 1 }).select("-user -status").lean(),
    Team.find().select("name position memberProfile gender year session department facebook linkedin github order").lean(),
  ]);
  // "Now at …" when a committee member also has an alumni profile
  const careers = new Map(alumni.map((a) => [key(a.name), { company: a.company, position: a.position }]));
  const years = [...new Set(team.map((t) => t.year))].sort((a, b) => b - a);
  const committees = years.map((year, i) => {
    const members = sortMembers(team.filter((t) => t.year === year)).map((m) => ({ ...m, nowAt: careers.get(key(m.name)) || null }));
    const sessions = [...new Set(members.map((m) => m.session).filter(Boolean))];
    return { year, current: i === 0, session: sessions.length === 1 ? sessions[0] : "", members };
  });
  return ok({ alumni, committees });
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
