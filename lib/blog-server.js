// Server-only helpers shared by the blog detail page and the blog API.
import { slugify } from "@/lib/blog-content";
import User from "@/models/User";

export { slugify };

const APPROVED = { $or: [{ status: "approved" }, { status: { $exists: false } }, { status: null }] };
export const approvedBlogFilter = APPROVED;

export function isPubliclyVisible(blog) {
  return !blog?.status || blog.status === "approved";
}

/** Author display info: linked member profile when the post was submitted by a user. */
export async function getAuthorInfo(blog) {
  const fallback = { name: blog?.author || "TPI CPC", username: null, avatar: null, isClub: !blog?.submittedBy };
  if (!blog?.submittedBy) return fallback;
  try {
    const u = await User.findById(blog.submittedBy).select("fullName username profileImage").lean();
    if (!u) return fallback;
    return {
      name: blog.author || u.fullName,
      username: u.username || null,
      avatar: u.profileImage || null,
      isClub: false,
    };
  } catch {
    return fallback;
  }
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;
export const isObjectId = (s) => OBJECT_ID.test(String(s || ""));

/** Mongo filter for a blog addressed by id or slug. */
export function blogLookup(idOrSlug) {
  return isObjectId(idOrSlug) ? { _id: idOrSlug } : { slug: String(idOrSlug).toLowerCase() };
}

/** Returns a slug not used by another post (appends -2, -3, … when taken). */
export async function uniqueSlug(Blog, wanted, excludeId = null) {
  let base = slugify(wanted);
  if (!base || isObjectId(base)) return undefined;
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const clash = await Blog.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select("_id").lean();
    if (!clash) return slug;
    slug = `${base}-${n}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

const isHttpUrl = (s) => /^https?:\/\/[^\s]+$/i.test(s || "");

/** Parses the optional `seo` JSON form field sent by the editor. */
export function parseSeo(raw) {
  if (!raw) return undefined;
  let v;
  try {
    v = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return undefined;
  }
  const clean = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);
  return {
    title: clean(v.title, 120),
    description: clean(v.description, 320),
    keywords: Array.isArray(v.keywords) ? v.keywords.map((k) => clean(k, 40)).filter(Boolean).slice(0, 15) : [],
    canonicalUrl: isHttpUrl(v.canonicalUrl) ? clean(v.canonicalUrl, 500) : "",
    ogImage: isHttpUrl(v.ogImage) ? clean(v.ogImage, 500) : "",
  };
}

/** Public path for a post (pretty slug when it has one). */
export const blogPath = (b) => `/blogs/${b.slug || b._id}`;
