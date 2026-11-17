// External job listings for the Jobs & Internships board.
// Every source is fetched server-side, cached on its own (6h) and fails soft:
// a broken source keeps its last good copy or is simply hidden from the page.
// Listings always link back to the original posting (as the providers ask).
import { cachedFetch, fetchWithTimeout } from "@/lib/remote-cache";

const TTL = 6 * 60 * 60 * 1000; // ≤ 4 fetches/day per source (Remotive's guidance)
const DAY = 86400000;

export const JOB_CATEGORIES = {
  swe: "Software / CSE",
  diploma: "Diploma engineering",
  govt: "Government (BD)",
};

// ---------------------------------------------------------------- helpers
const text = (html = "", max = 220) =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
const decode = (s = "") => text(String(s).replace(/<!\[CDATA\[|\]\]>/g, ""), 300);
const iso = (d) => {
  if (!d) return null;
  const t = typeof d === "number" || /^\d+$/.test(String(d)) ? new Date(Number(d) * (String(d).length <= 10 ? 1000 : 1)) : new Date(d);
  return isNaN(t) ? null : t.toISOString();
};
function jobType(...hints) {
  const s = hints.flat().filter(Boolean).join(" ").toLowerCase();
  if (/intern|trainee|werkstudent|praktikum|apprentice|working student/.test(s)) return "Internship";
  if (/part[\s_-]?time|teilzeit/.test(s)) return "Part-time";
  if (/contract|freelance|temporary|befristet/.test(s)) return "Contract";
  return "Full-time";
}
const tagsOf = (arr, n = 4) => [...new Set((Array.isArray(arr) ? arr : []).map((t) => String(t).trim()).filter(Boolean))].slice(0, n);
const TECH_RE = /(software|developer|engineer|programmer|frontend|front-end|backend|back-end|full.?stack|devops|sre|data (scientist|engineer|analyst)|machine learning|\bml\b|\bai\b|ios|android|mobile|qa|test|cloud|security|web|react|node|python|java|golang|rust|php|\.net)/i;
const NON_TECH_RE = /(sales|marketing|account (manager|executive)|recruit|hr\b|finance|legal|customer success|support specialist|animator|copywriter|assistenz|sachbearbeit|vertrieb|business development)/i;

// ---------------------------------------------------------------- sources
async function remotive() {
  const d = await fetchWithTimeout("https://remotive.com/api/remote-jobs?category=software-dev&limit=60");
  return (d.jobs || []).map((j) => ({
    id: `remotive-${j.id}`,
    title: j.title, company: j.company_name, location: j.candidate_required_location || "Worldwide", remote: true,
    type: jobType(j.job_type, j.title), tags: tagsOf(j.tags), salary: j.salary || "",
    postedAt: iso(j.publication_date), deadline: null, url: j.url, logo: j.company_logo || "", summary: text(j.description),
  }));
}

async function remoteok() {
  const d = await fetchWithTimeout("https://remoteok.com/api");
  return (Array.isArray(d) ? d.slice(1) : [])
    .filter((j) => j.position && TECH_RE.test(`${j.position} ${(j.tags || []).join(" ")}`) && !NON_TECH_RE.test(j.position))
    .slice(0, 60)
    .map((j) => ({
      id: `remoteok-${j.id}`,
      title: text(j.position, 140), company: text(j.company, 80), location: j.location || "Worldwide", remote: true,
      type: jobType(j.position, j.tags), tags: tagsOf(j.tags),
      salary: Number(j.salary_min) > 0 ? `$${Math.round(j.salary_min / 1000)}k – $${Math.round(j.salary_max / 1000)}k` : "",
      postedAt: iso(j.date || j.epoch), deadline: null, url: j.url || j.apply_url, logo: j.company_logo || j.logo || "", summary: text(j.description),
    }));
}

async function jobicy() {
  const d = await fetchWithTimeout("https://jobicy.com/api/v2/remote-jobs?count=50&industry=engineering");
  return (d.jobs || []).map((j) => ({
    id: `jobicy-${j.id}`,
    title: text(j.jobTitle, 140), company: j.companyName, location: j.jobGeo || "Anywhere", remote: true,
    type: jobType(j.jobType, j.jobTitle), tags: tagsOf([j.jobLevel, ...(j.jobIndustry || [])]),
    salary: j.annualSalaryMin ? `${j.salaryCurrency || "$"} ${Math.round(j.annualSalaryMin / 1000)}k – ${Math.round(j.annualSalaryMax / 1000)}k / yr` : "",
    postedAt: iso(j.pubDate), deadline: null, url: j.url, logo: j.companyLogo || "", summary: text(j.jobExcerpt),
  }));
}

async function weworkremotely() {
  const xml = await fetchWithTimeout("https://weworkremotely.com/categories/remote-programming-jobs.rss", { as: "text" });
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  const tag = (it, t) => (it.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)) || [])[1] || "";
  return items.slice(0, 50).map((it) => {
    const full = decode(tag(it, "title"));
    const [company, ...rest] = full.split(":");
    const title = rest.length ? rest.join(":").trim() : full;
    return {
      id: `wwr-${tag(it, "guid").split("/").pop()}`,
      title, company: rest.length ? company.trim() : "", location: decode(tag(it, "region")) || "Anywhere", remote: true,
      type: jobType(title, decode(tag(it, "type"))), tags: tagsOf([decode(tag(it, "category"))]), salary: "",
      postedAt: iso(tag(it, "pubDate")), deadline: null, url: decode(tag(it, "link")), logo: "", summary: "",
    };
  }).filter((j) => j.url && !NON_TECH_RE.test(j.title));
}

async function arbeitnow() {
  const d = await fetchWithTimeout("https://www.arbeitnow.com/api/job-board-api");
  return (d.data || [])
    .filter((j) => TECH_RE.test(j.title) && !NON_TECH_RE.test(j.title))
    .slice(0, 50)
    .map((j) => ({
      id: `arbeitnow-${j.slug}`,
      title: text(j.title, 140), company: j.company_name, location: j.remote ? "Remote (Germany)" : `${j.location}, Germany`, remote: !!j.remote,
      type: jobType(j.job_types, j.title), tags: tagsOf(j.tags), salary: "",
      postedAt: iso(j.created_at), deadline: null, url: j.url, logo: "", summary: text(j.description),
    }));
}

// Bdjobs (Bangladesh) — the public JSON search used by bdjobs.com itself.
async function bdjobsSearch(keyword, pages = 1) {
  const out = [];
  for (let pg = 1; pg <= pages; pg++) {
    const d = await fetchWithTimeout(`https://api.bdjobs.com/jobs/api/v1/JobSearch/GetJobSearch?keyword=${encodeURIComponent(keyword)}&pg=${pg}`);
    if (d?.statuscode !== "1" && !Array.isArray(d?.data)) throw new Error("Unexpected response");
    out.push(...(d.data || []));
    if (!d.data?.length) break;
  }
  return out;
}
const bdMap = (j) => ({
  id: `bdjobs-${j.Jobid}`,
  title: text(j.jobTitle, 140), company: text(j.companyName, 100), location: j.location || "Bangladesh",
  remote: /remote|work from home|anywhere/i.test(`${j.WorkPlace} ${j.location}`) && /remote|home/i.test(String(j.WorkPlace)),
  type: jobType(j.JobType, j.jobTitle), tags: tagsOf([j.experience && `Exp: ${j.experience}`, j.WorkPlace]),
  salary: j.Salary && j.Salary !== "--" ? j.Salary : "",
  postedAt: iso(j.publishDate), deadline: iso(j.deadlineDB), url: `https://bdjobs.com/h/details/${j.Jobid}`,
  logo: j.logoUrl || "", summary: text(j.eduRec || j.jobDescription, 160), vacancies: j.Vacancies || null,
});

async function bdjobsSoftware() {
  const [swe, intern] = await Promise.all([bdjobsSearch("software engineer", 2), bdjobsSearch("intern", 1)]);
  const it = intern.filter((j) => Number(j.Cat_id) === 8 || TECH_RE.test(j.jobTitle));
  const seen = new Set();
  return [...it, ...swe]
    .filter((j) => !NON_TECH_RE.test(j.jobTitle) && !seen.has(j.Jobid) && seen.add(j.Jobid))
    .map(bdMap);
}

const DIPLOMA_RE = /(diploma|engineer|technician|draft|draughts|survey|foreman|supervisor|electric|mechanic|civil|autocad|\bcad\b|site|maintenance|instrument|power|textile|rac|refrigerat)/i;
async function bdjobsDiploma() {
  const [a, b] = await Promise.all([bdjobsSearch("diploma engineer", 2), bdjobsSearch("sub assistant engineer", 1)]);
  const seen = new Set();
  return [...a, ...b]
    .filter((j) => DIPLOMA_RE.test(j.jobTitle) && !/(medical|dmf|nurs|pharma|doctor)/i.test(j.jobTitle) && !NON_TECH_RE.test(j.jobTitle))
    .filter((j) => !seen.has(j.Jobid) && seen.add(j.Jobid))
    .map(bdMap);
}

// Alljobs by Teletalk — official BD government circular portal (public list endpoint).
export const GOVT_TECH_RE = /(sub[\s-]?assistant engineer|assistant engineer|উপ-?সহকারী প্রকৌশলী|প্রকৌশলী|diploma|technician|mechanic|lineman|wireman|electrician|draftsman|draughtsman|surveyor|foreman|instructor|computer operator|data entry|programmer|estimator|plate maker|machine|workshop|lab assistant|network|hardware|\bict\b|computer)/i;
// Clerical posts that only mention "computer" (typist/steno) aren't diploma-engineering roles
const GOVT_NOT_TECH_RE = /(typist|steno|\(english\)|\(research)/i;
async function teletalkGovt() {
  const out = [];
  for (let page = 1; page <= 6; page++) {
    const d = await fetchWithTimeout(`https://alljobs.teletalk.com.bd/api/v1/govt-jobs/list?page=${page}&limit=20`);
    if (d?.status !== "success") throw new Error(d?.message?.en || "Unexpected response");
    out.push(...(d.govtJobs || []));
    if ((d.govtJobs || []).length < 20) break;
  }
  return out.map((j) => {
    const org = j.job_utilities_govtorganization || {};
    return {
      id: `teletalk-${j.id}`,
      title: j.job_title, titleBn: j.job_title_bn || "", company: org.name || "Government of Bangladesh", companyBn: org.name_bn || "",
      location: "Bangladesh", remote: false, type: "Full-time",
      tags: tagsOf([j.vacancy_not_specific ? "Vacancies: not specified" : j.vacancy && `${Number(j.vacancy)} post${Number(j.vacancy) > 1 ? "s" : ""}`, org.short_name]),
      salary: "", postedAt: iso(j.published_date), deadline: iso(j.deadline_date),
      url: `https://alljobs.teletalk.com.bd/jobs/government/${j.organization_id}?jobId=${j.id}`,
      applyUrl: j.application_site || "",
      logo: org.logo ? `https://alljobs.teletalk.com.bd/media/${org.logo}` : "",
      summary: "", diplomaRelevant: GOVT_TECH_RE.test(`${j.job_title} ${j.job_title_bn}`) && !GOVT_NOT_TECH_RE.test(j.job_title || ""),
    };
  });
}

export const JOB_SOURCES = [
  { id: "bdjobs-swe", label: "Bdjobs", home: "https://bdjobs.com", category: "swe", region: "Bangladesh", load: bdjobsSoftware },
  { id: "remotive", label: "Remotive", home: "https://remotive.com", category: "swe", region: "Remote", load: remotive },
  { id: "remoteok", label: "Remote OK", home: "https://remoteok.com", category: "swe", region: "Remote", load: remoteok },
  { id: "jobicy", label: "Jobicy", home: "https://jobicy.com", category: "swe", region: "Remote", load: jobicy },
  { id: "weworkremotely", label: "We Work Remotely", home: "https://weworkremotely.com", category: "swe", region: "Remote", load: weworkremotely },
  { id: "arbeitnow", label: "Arbeitnow", home: "https://www.arbeitnow.com", category: "swe", region: "Germany / remote", load: arbeitnow },
  { id: "bdjobs-diploma", label: "Bdjobs", home: "https://bdjobs.com", category: "diploma", region: "Bangladesh", load: bdjobsDiploma },
  { id: "teletalk-govt", label: "Alljobs (Teletalk)", home: "https://alljobs.teletalk.com.bd/jobs/government", category: "govt", region: "Bangladesh", load: teletalkGovt },
];

/** All external listings, per-source cached. `force` refetches every source (admin "refresh now"). */
export async function getExternalJobs({ force = false } = {}) {
  const results = await Promise.all(
    JOB_SOURCES.map(async (s) => {
      const r = await cachedFetch(`jobs:${s.id}:v1`, s.load, { ttlMs: TTL, retryMs: 30 * 60 * 1000, force });
      return { s, r };
    })
  );
  const now = Date.now();
  const seen = new Set();
  const jobs = [];
  const sources = [];
  for (const { s, r } of results) {
    const list = Array.isArray(r.data) ? r.data : [];
    let count = 0;
    for (const j of list) {
      if (!j?.url || !j.title || seen.has(j.id)) continue;
      if (j.deadline && new Date(j.deadline).getTime() < now - DAY) continue; // expired
      seen.add(j.id);
      jobs.push({ ...j, category: s.category, source: s.id, sourceLabel: s.label, sourceHome: s.home, external: true });
      count++;
    }
    sources.push({ id: s.id, label: s.label, home: s.home, category: s.category, region: s.region, ok: r.ok, stale: r.stale, error: r.ok ? null : r.error, count, fetchedAt: r.fetchedAt });
  }
  // Newest first, with a small boost for Bangladesh sources so local openings aren't buried
  const score = (j) => new Date(j.postedAt || 0).getTime() + (j.category !== "swe" || j.source === "bdjobs-swe" ? 12 * 3600e3 : 0);
  jobs.sort((a, b) => score(b) - score(a));
  return { jobs, sources, refreshedAt: new Date().toISOString() };
}
