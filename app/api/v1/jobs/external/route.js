import { ok, withDB } from "@/lib/crud";
import { getExternalJobs, JOB_CATEGORIES } from "@/lib/job-feeds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Public: auto-updating listings from public job feeds (each source cached for 6h).
export const GET = withDB(async () => {
  const { jobs, sources } = await getExternalJobs();
  return ok({
    jobs,
    // failed sources without any cached copy are simply left out of the UI
    sources: sources.filter((s) => s.count > 0).map(({ id, label, home, category, region, count, fetchedAt, stale }) => ({ id, label, home, category, region, count, fetchedAt, stale })),
    categories: JOB_CATEGORIES,
  });
});
