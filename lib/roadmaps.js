// roadmap.sh roadmaps (role, skill and beginner tracks) for the Learning Path page.
// Source: roadmap.sh's public page index (built from the kamranahmedse/developer-roadmap
// repo), cached for 24h. A bundled snapshot is used if the live list is unavailable.
import { cachedFetch, fetchWithTimeout } from "@/lib/remote-cache";
import { ROADMAPS_FALLBACK } from "@/lib/roadmaps-fallback";

const SOURCE_URL = "https://roadmap.sh/pages.json";
const TTL = 24 * 60 * 60 * 1000;

// Light grouping so 100 cards stay scannable.
const DOMAINS = [
  ["cs", /^(datastructures-and-algorithms|computer-science|leetcode|system-design|software-design-architecture|software-architect|api-design|code-review|git-github)/],
  ["ai", /(^ai-|machine-learning|mlops|data-|bi-analyst|power-bi|prompt-engineering|python-data|inference|claude-code|codex|cursor|vibe-coding|openclaw|ai-agents|r-programming)/],
  ["web", /^(frontend|backend|full-stack|react$|vue|angular|nextjs|nodejs|javascript|typescript|html|css|graphql|php|laravel|django|wordpress|aspnet-core|spring-boot|ruby-on-rails|design-system)/],
  ["mobile", /^(android|ios|flutter|react-native|swift-ui|kotlin)/],
  ["devops", /^(devops|docker|kubernetes|aws|terraform|cloud|linux|shell-bash|cloudflare|network-engineer|devsecops)/],
  ["db", /^(sql|postgresql|mongodb|redis|elasticsearch)/],
  ["lang", /^(python|java$|c$|cpp|rust|golang|ruby$|scala)/],
  ["security", /^(cyber-security|ai-red-teaming|blockchain)/],
  ["product", /^(product-|ux-design|technical-writer|engineering-manager|devrel|qa|seo|game-developer|server-side-game|forward-deployed)/],
];
export const DOMAIN_LABELS = {
  cs: "CS & problem solving", ai: "AI & data", web: "Web development", mobile: "Mobile", devops: "DevOps & cloud",
  db: "Databases", lang: "Languages", security: "Security & web3", product: "Product, design & more", other: "Other",
};
const RECOMMENDED = ["datastructures-and-algorithms", "cpp", "computer-science", "leetcode", "python", "frontend", "backend", "git-github"];

function domainOf(slug) {
  for (const [d, re] of DOMAINS) if (re.test(slug)) return d;
  return "other";
}

function normalize(list) {
  const year = new Date().getFullYear();
  return list.map((r) => ({
    ...r,
    description: String(r.description || "").replace(/@currentYear@|\{year\}/g, year),
    domain: domainOf(r.slug),
    url: `https://roadmap.sh/${r.slug}`,
    recommended: RECOMMENDED.includes(r.slug),
  }));
}

async function loadLive() {
  const pages = await fetchWithTimeout(SOURCE_URL, { timeout: 10000 });
  if (!Array.isArray(pages)) throw new Error("Unexpected response");
  const list = pages
    .filter((p) => p.group === "Roadmaps" && Array.isArray(p.metadata?.tags) && p.metadata.tags.length)
    .map((p) => {
      const tags = p.metadata.tags;
      return {
        slug: String(p.id || p.url || "").replace(/^\//, ""),
        title: p.title,
        kind: tags.includes("beginner-roadmap") ? "beginner" : tags.includes("role-roadmap") ? "role" : "skill",
        description: p.description || "",
        updatedAt: p.updatedAt || null,
      };
    })
    .filter((r) => /^[a-z0-9-]+$/.test(r.slug) && r.title);
  if (list.length < 20) throw new Error("Too few roadmaps in response");
  return list;
}

export async function getRoadmaps({ force = false } = {}) {
  const res = await cachedFetch("roadmaps:roadmap.sh:v1", loadLive, { ttlMs: TTL, retryMs: 60 * 60 * 1000, force });
  if (res.data?.length) {
    return { roadmaps: normalize(res.data), source: res.ok ? "live" : "cache", fetchedAt: res.fetchedAt };
  }
  const bundled = ROADMAPS_FALLBACK.map(([slug, title, kind, description]) => ({ slug, title, kind, description }));
  return { roadmaps: normalize(bundled), source: "bundled", fetchedAt: null };
}
