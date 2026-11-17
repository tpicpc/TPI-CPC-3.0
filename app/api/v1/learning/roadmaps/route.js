import { ok, withDB } from "@/lib/crud";
import { DOMAIN_LABELS, getRoadmaps } from "@/lib/roadmaps";

export const dynamic = "force-dynamic";

// Public: every roadmap.sh roadmap (cached 24h, bundled fallback).
export const GET = withDB(async () => {
  const data = await getRoadmaps();
  return ok({ ...data, domains: DOMAIN_LABELS });
});
