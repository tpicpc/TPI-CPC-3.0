import { connectDB } from "@/lib/db";
import { ok, serverError } from "@/lib/api-response";
import { approvedBlogFilter, blogLookup } from "@/lib/blog-server";
import Blog from "@/models/Blog";

// Public: count one read (the client sends this once per browser session)
export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    await Blog.updateOne({ $and: [blogLookup(id), approvedBlogFilter] }, { $inc: { views: 1 } });
    return ok({});
  } catch (e) {
    return serverError(e);
  }
}
