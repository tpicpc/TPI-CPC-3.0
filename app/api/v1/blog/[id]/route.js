import { connectDB } from "@/lib/db";
import { authError, getTokenFromRequest, requireAuth, verifyToken } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import { blogLookup, getAuthorInfo, parseSeo, uniqueSlug } from "@/lib/blog-server";
import Blog from "@/models/Blog";
import BlogComment from "@/models/BlogComment";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findOne(blogLookup(id)).lean();
    if (!blog) return fail("Blog not found", 404);

    // Only approved posts are publicly viewable; admins can see anything
    if (blog.status && blog.status !== "approved") {
      const token = getTokenFromRequest(req);
      const payload = token && verifyToken(token);
      if (payload?.role !== "admin" && payload?.id !== String(blog.submittedBy)) {
        return fail("Blog not found", 404);
      }
    }

    const authorInfo = await getAuthorInfo(blog);
    return ok({ blog, authorInfo });
  } catch (e) {
    return serverError(e);
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const updates = {};
    for (const k of ["title", "subtitle", "description", "author", "status"]) {
      if (data[k] !== undefined) updates[k] = data[k];
    }
    if (data.tags) updates.tags = JSON.parse(data.tags);
    if (data.seo !== undefined) updates.seo = parseSeo(data.seo);
    const unset = {};
    if (data.slug !== undefined) {
      const slug = await uniqueSlug(Blog, data.slug, id);
      if (slug) updates.slug = slug;
      else unset.slug = 1;
    }
    const file = formData.getAll("image").find((e) => e && typeof e !== "string");
    if (file) {
      updates.image = await uploadFormFileToImgBB(file);
    } else if (typeof data.image === "string" && /^https?:\/\//.test(data.image)) {
      // Cover already uploaded via /api/v1/upload (new editor uploads on select)
      updates.image = data.image;
    }
    const blog = await Blog.findByIdAndUpdate(
      id,
      Object.keys(unset).length ? { $set: updates, $unset: unset } : updates,
      { new: true }
    ).lean();
    if (!blog) return fail("Blog not found", 404);
    return ok({ blog }, "Blog updated");
  } catch (e) {
    return serverError(e);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) return fail("Blog not found", 404);
    await BlogComment.deleteMany({ blog: deleted._id });
    return ok({}, "Blog deleted");
  } catch (e) {
    return serverError(e);
  }
}
