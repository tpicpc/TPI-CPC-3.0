import { ok, withAuth } from "@/lib/crud";
import { getExternalJobs } from "@/lib/job-feeds";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Admin: status of every external job source (GET) or force a refresh now (POST).
export const GET = withAuth("admin", async () => {
  const { sources } = await getExternalJobs();
  return ok({ sources });
});

export const POST = withAuth("admin", async () => {
  const { sources, jobs } = await getExternalJobs({ force: true });
  const okCount = sources.filter((s) => s.ok).length;
  return ok({ sources, total: jobs.length }, `Refreshed — ${okCount}/${sources.length} sources OK, ${jobs.length} listings`);
});
