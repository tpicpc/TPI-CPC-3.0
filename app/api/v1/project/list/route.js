import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import Project from "@/models/Project";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const owner = url.searchParams.get("owner");

    let filter = { status: "approved" };
    if (status) {
      const token = getTokenFromRequest(req);
      const payload = token && verifyToken(token);
      if (payload?.role === "admin") {
        filter = status === "all" ? {} : { status };
      } else if (payload?.id && status === "mine") {
        filter = { owner: payload.id };
      }
    }
    if (owner) filter.owner = owner;

    const projects = await Project.find(filter)
      .populate("owner", "fullName profileImage department")
      .sort({ featured: -1, createdAt: -1 })
      .select("-comments")
      .lean();

    const enriched = projects.map((p) => ({
      ...p,
      likeCount: (p.likes || []).length,
      commentCount: 0,
      likes: undefined,
    }));

    return ok({ projects: enriched });
  } catch (e) {
    return serverError(e);
  }
}
