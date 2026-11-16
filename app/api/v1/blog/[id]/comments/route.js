import { connectDB } from "@/lib/db";
import { authError, getTokenFromRequest, requireAuth, verifyToken } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { blogLookup, isPubliclyVisible } from "@/lib/blog-server";
import { getClientIp, getUserAgent } from "@/lib/request-ip";
import Blog from "@/models/Blog";
import BlogComment from "@/models/BlogComment";
import User from "@/models/User";

const MIN_LEN = 2;
const MAX_LEN = 1000;
const COOLDOWN_MS = 20 * 1000; // one comment per 20s per user
const HOURLY_LIMIT = 10; // and at most 10 per hour

// Comments are stored as plain text: strip any markup and control chars, collapse
// runs of blank lines. React escapes it again when rendering.
function cleanText(s = "") {
  return String(s)
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const blog = await Blog.findOne(blogLookup(id)).select("_id").lean();
    if (!blog) return fail("Blog not found", 404);

    const token = getTokenFromRequest(req);
    const payload = token && verifyToken(token);
    const isAdmin = payload?.role === "admin";

    let q = BlogComment.find({ blog: blog._id }).sort({ createdAt: -1 }).limit(200);
    if (isAdmin) q = q.select("+ip +userAgent"); // moderation data: admins only
    const comments = await q.lean();
    return ok({ comments, total: comments.length });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const text = cleanText(body?.text);
    if (text.length < MIN_LEN) return fail("Comment is too short", 400);
    if (text.length > MAX_LEN) return fail(`Comments are limited to ${MAX_LEN} characters`, 400);

    const user = await User.findById(auth.user.id).select("fullName username profileImage emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) return fail("Verify your email before commenting", 403);

    const blog = await Blog.findOne(blogLookup(id)).select("_id status").lean();
    if (!blog || !isPubliclyVisible(blog)) return fail("Blog not found", 404);

    // Basic rate limiting per user
    const last = await BlogComment.findOne({ user: user._id }).sort({ createdAt: -1 }).select("createdAt").lean();
    if (last && Date.now() - new Date(last.createdAt).getTime() < COOLDOWN_MS) {
      return fail("You're commenting too fast — please wait a few seconds", 429);
    }
    const recent = await BlogComment.countDocuments({ user: user._id, createdAt: { $gt: new Date(Date.now() - 3600 * 1000) } });
    if (recent >= HOURLY_LIMIT) return fail("Comment limit reached — please try again later", 429);

    const created = await BlogComment.create({
      blog: blog._id,
      user: user._id,
      name: user.fullName,
      username: user.username || "",
      avatar: user.profileImage || "",
      text,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });
    await Blog.updateOne({ _id: blog._id }, { $inc: { commentCount: 1 } });

    const { ip: _ip, userAgent: _ua, ...comment } = created.toObject();
    return ok({ comment }, "Comment posted");
  } catch (e) {
    return serverError(e);
  }
}
