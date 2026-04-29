import mongoose from "mongoose";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const env = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
const LIVE_API = "https://api.tpicpc.com/api/v1";
const OLD_TEAM_PAGE = "https://tpicpc.vercel.app/team";

if (!MONGODB_URI) {
  console.error("MONGODB_URI not set");
  process.exit(1);
}

const teamSchema = new mongoose.Schema(
  {
    name: String, position: String, memberProfile: String, gender: String,
    year: { type: Number, index: true },
    bio: String, facebook: String, linkedin: String, github: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const advisorSchema = new mongoose.Schema(
  { name: String, position: String, advisorProfile: String, gender: String, order: { type: Number, default: 0 } },
  { timestamps: true }
);

const FEMALE_HINTS = [
  /\bakter\b/i, /\baktar\b/i, /\bbegum\b/i, /\bkhatun\b/i,
  /\brinky\b/i, /\bmitu\b/i, /\btasnim\b/i, /\bbushra\b/i,
  /\batia\b/i, /\bmaria\b/i, /\bnadia\b/i, /\bsadia\b/i, /\bfatima\b/i,
  /\bjannatul\b/i, /\bsumaiya\b/i, /\bzarin\b/i, /\bzahin\b/i,
  /\bayesha\b/i, /\baisha\b/i, /\bmuntaha\b/i, /\barifa\b/i,
  /\bkhadija\b/i, /\bnusrat\b/i, /\bnafisa\b/i, /\bnahida\b/i,
  /\briya\b/i, /\bnishi\b/i, /\bpriya\b/i, /\bsumi\b/i, /\brahaman\b/i,
  /\bpayel\b/i, /\bjannat\b/i, /\bjannatu\b/i, /\bsania\b/i, /\bsumaya\b/i,
  /\bmst\.?\b/i, /\bms\.?\b/i, /\bmiss\b/i, /\bmrs\.?\b/i,
];
const MALE_HINTS = [
  /\bmd\.?\b/i, /\bmohammad\b/i, /\bmohammed\b/i, /\bmuhammad\b/i,
  /\bahmed\b/i, /\bahmad\b/i, /\bhossain\b/i, /\bhasan\b/i, /\bhassan\b/i,
  /\brahman\b/i, /\bislam\b/i, /\bkhan\b/i, /\babdul\b/i, /\bsheikh\b/i,
  /\bhaque\b/i, /\bhaq\b/i, /\bmir\b/i, /\bsiddique\b/i,
];
function guessGender(name = "") {
  const n = ` ${name} `;
  // Female hints take priority — they are more specific (Akter suffix, Mst prefix, etc.)
  // and a name like "MD Payel" should be flagged female via the Payel hint
  for (const r of FEMALE_HINTS) if (r.test(n)) return "female";
  for (const r of MALE_HINTS) if (r.test(n)) return "male";
  return "";
}
const eventSchema = new mongoose.Schema(
  {
    title: String, location: String, description: String, eventType: String,
    organizer: String, collaboration: String, startTime: String, endTime: String,
    status: String, eventImage: String,
  },
  { timestamps: true }
);
const blogSchema = new mongoose.Schema(
  { title: String, description: String, image: String, author: { type: String, default: "TPI CPC" }, tags: [String] },
  { timestamps: true }
);
const reviewSchema = new mongoose.Schema(
  {
    fullName: String, semester: String, shift: String, reviewMessage: String,
    department: String, profileImage: String, approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Team = mongoose.models.Team || mongoose.model("Team", teamSchema);
const Advisor = mongoose.models.Advisor || mongoose.model("Advisor", advisorSchema);
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

function normalizeStatus(s) {
  if (!s) return "Completed";
  const v = String(s).trim().toLowerCase();
  if (v === "upcoming" || v === "upcomming") return "Upcoming";
  if (v === "ongoing") return "Ongoing";
  if (v === "completed" || v === "finished" || v === "done") return "Completed";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
}
async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}
async function tryFetch(...urls) {
  for (const u of urls) {
    try { return await fetchJSON(u); } catch {}
  }
  return null;
}

// Parse the old vercel /team HTML for 2024 + 2023 sections
function parseOldTeamHTML(html) {
  const result = { 2024: [], 2023: [] };
  const idx2024 = html.indexOf("Meet The Team 2024");
  const idx2023 = html.indexOf("Meet The 2023 EX Team");
  const sections = [
    { year: 2024, start: idx2024, end: idx2023 > 0 ? idx2023 : html.length },
    { year: 2023, start: idx2023, end: html.length },
  ];
  // Match member blocks: img alt + name + role
  const memberRe = /<img[^>]*alt="([^"]+)"[^>]*src="([^"]+)"[^>]*>[\s\S]{0,2000}?<h2[^>]*>([^<]+)<\/h2>[\s\S]{0,400}?<p[^>]*font-bold[^>]*>([^<]+)<\/p>/g;
  for (const sec of sections) {
    if (sec.start < 0) continue;
    const seg = html.substring(sec.start, sec.end);
    memberRe.lastIndex = 0;
    const seen = new Set();
    let m;
    while ((m = memberRe.exec(seg))) {
      const name = m[3].trim();
      const role = m[4].trim();
      const image = m[2];
      const key = name + "|" + role;
      if (seen.has(key)) continue;
      seen.add(key);
      result[sec.year].push({ name, position: role, memberProfile: image });
    }
  }
  return result;
}

(async () => {
  console.log("→ Connecting to Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("✓ Connected\n");

  const reports = [];
  const homeData = await fetchJSON(`${LIVE_API}/home-page/data`);

  // ---- Advisors
  console.log("→ Importing advisors...");
  const aJson = await tryFetch(`${LIVE_API}/advisor/list`);
  const advisors = (aJson?.advisors) || homeData.advisors || [];
  await Advisor.deleteMany({});
  let aCreated = 0;
  for (const a of advisors) {
    if (!a.name || !a.advisorProfile) continue;
    await Advisor.create({
      name: a.name.trim(),
      position: (a.position || "Advisor").trim(),
      advisorProfile: a.advisorProfile,
      gender: guessGender(a.name),
    });
    aCreated++;
  }
  reports.push(`Advisors: ${aCreated}`);
  console.log(`✓ Advisors: ${aCreated}\n`);

  // ---- Teams (multi-year)
  console.log("→ Fetching old vercel /team page for 2024 + 2023...");
  let oldTeamHtml = "";
  try { oldTeamHtml = await fetchText(OLD_TEAM_PAGE); } catch (e) { console.warn("  (skip old page)", e.message); }
  const oldTeams = oldTeamHtml ? parseOldTeamHTML(oldTeamHtml) : { 2024: [], 2023: [] };

  console.log("→ Fetching current team from live API...");
  const teamJson = await tryFetch(`${LIVE_API}/team/list`);
  const teamMembersCurrent = teamJson?.teamMembers || teamJson?.team || homeData.teamMembers || [];
  // exTeams in tpicpc.com → these are 2024-as-ex (per user clarification, ex on the new site means 2024 team)
  // But we're also pulling 2024 from old page; merge & dedupe by name+position.
  const exTeamFromLive = homeData.exTeams || [];

  await Team.deleteMany({});

  // Year map per user spec:
  //   live "Meet Our Team Members 2025" → year 2025
  //   live "Ex Team" (i.e. 2024)         → year 2024
  //   old page "Meet The Team 2024"      → year 2024
  //   old page "Meet The 2023 EX Team"   → year 2023

  const buckets = { 2025: [], 2024: [], 2023: [] };

  for (const m of teamMembersCurrent) {
    if (!m.name || !m.memberProfile) continue;
    buckets[2025].push({ name: m.name.trim(), position: (m.position || "Member").trim(), memberProfile: m.memberProfile });
  }
  for (const m of exTeamFromLive) {
    if (!m.name || !m.memberProfile) continue;
    buckets[2024].push({ name: m.name.trim(), position: (m.position || "Member").trim(), memberProfile: m.memberProfile });
  }
  for (const m of oldTeams[2024] || []) {
    buckets[2024].push(m);
  }
  for (const m of oldTeams[2023] || []) {
    buckets[2023].push(m);
  }

  // Dedupe inside each year by lowercased name
  for (const y of Object.keys(buckets)) {
    const seen = new Set();
    buckets[y] = buckets[y].filter((m) => {
      const key = (m.name || "").toLowerCase().replace(/\s+/g, " ").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  let totalTeam = 0;
  for (const [year, list] of Object.entries(buckets)) {
    for (const m of list) {
      await Team.create({ ...m, year: Number(year), gender: guessGender(m.name) });
      totalTeam++;
    }
    console.log(`  ✓ year ${year}: ${list.length}`);
    reports.push(`Team ${year}: ${list.length}`);
  }
  console.log(`✓ Teams total: ${totalTeam}\n`);

  // ---- Events
  console.log("→ Importing events...");
  const eJson = await tryFetch(`${LIVE_API}/event/list`);
  const events = eJson?.events || homeData.events || [];
  await Event.deleteMany({});
  let eCreated = 0;
  for (const ev of events) {
    if (!ev.title) continue;
    await Event.create({
      title: ev.title,
      location: ev.location || "TBA",
      description: ev.description || "",
      eventType: ev.eventType || "Event",
      organizer: ev.organizer || "TPI CPC",
      collaboration: ev.collaboration || "",
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      status: normalizeStatus(ev.status),
      eventImage: ev.eventImage || "",
    });
    eCreated++;
  }
  reports.push(`Events: ${eCreated}`);
  console.log(`✓ Events: ${eCreated}\n`);

  // ---- Blogs
  console.log("→ Importing blogs...");
  const bJson = await tryFetch(`${LIVE_API}/blog/list`);
  const blogs = bJson?.blogs || homeData.blogs || [];
  await Blog.deleteMany({});
  let bCreated = 0;
  for (const blog of blogs) {
    if (!blog.title) continue;
    await Blog.create({
      title: blog.title,
      description: blog.description || "",
      image: blog.image || "",
      author: blog.author || "TPI CPC",
    });
    bCreated++;
  }
  reports.push(`Blogs: ${bCreated}`);
  console.log(`✓ Blogs: ${bCreated}\n`);

  // ---- Reviews
  console.log("→ Importing reviews...");
  const rJson = await tryFetch(`${LIVE_API}/review/list`);
  const reviews = rJson?.reviews || homeData.reviews || [];
  await Review.deleteMany({});
  let rCreated = 0;
  for (const rv of reviews) {
    if (!rv.fullName || !rv.reviewMessage) continue;
    await Review.create({
      fullName: rv.fullName,
      semester: rv.semester || "—",
      shift: rv.shift || "—",
      reviewMessage: rv.reviewMessage,
      department: rv.department || "—",
      profileImage: rv.profileImage || "",
      approved: true,
    });
    rCreated++;
  }
  reports.push(`Reviews: ${rCreated}`);
  console.log(`✓ Reviews: ${rCreated}\n`);

  console.log("─".repeat(40));
  console.log("Import complete:");
  reports.forEach((r) => console.log("  • " + r));
  console.log("─".repeat(40));
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (err) => {
  console.error("Import failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
