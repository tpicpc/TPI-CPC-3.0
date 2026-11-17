import { ok, serverError } from "@/lib/api-response";
import { getUpcomingContests } from "@/lib/cp";

export const dynamic = "force-dynamic";

// Public: upcoming Codeforces / CodeChef / AtCoder contests (cached ~30 min server-side).
export async function GET() {
  try {
    const data = await getUpcomingContests();
    return ok(data);
  } catch (e) {
    return serverError(e);
  }
}
