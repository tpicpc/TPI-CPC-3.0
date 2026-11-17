import ArticleView from "@/components/blog/ArticleView";
import BlogPreviewFallback from "@/components/blog/BlogPreviewFallback";
import { excerpt } from "@/lib/blog-content";
import { approvedBlogFilter, blogLookup, blogPath, getAuthorInfo, isPubliclyVisible } from "@/lib/blog-server";
import { connectDB } from "@/lib/db";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog";
import Blog from "@/models/Blog";
import { cache } from "react";

export const dynamic = "force-dynamic";

const getBlog = cache(async (id) => {
  if (!id || !/^[a-z0-9-]{1,100}$/i.test(id)) return null;
  try {
    await connectDB();
    return await Blog.findOne(blogLookup(decodeURIComponent(id))).lean();
  } catch {
    return null;
  }
});

async function getRelated(blog) {
  try {
    const fields = "title subtitle slug description image author tags createdAt approvedAt";
    const base = { ...approvedBlogFilter, _id: { $ne: blog._id } };
    const tags = (blog.tags || []).filter(Boolean);
    let related = tags.length
      ? await Blog.find({ ...base, tags: { $in: tags } }).sort({ createdAt: -1 }).limit(3).select(fields).lean()
      : [];
    if (related.length < 3) {
      const more = await Blog.find({ ...base, _id: { $nin: [blog._id, ...related.map((r) => r._id)] } })
        .sort({ createdAt: -1 })
        .limit(3 - related.length)
        .select(fields)
        .lean();
      related = [...related, ...more];
    }
    return related.map((r) => ({ ...r, _id: String(r._id) }));
  } catch {
    return [];
  }
}

/** Effective SEO values: explicit overrides from the editor, else derived from the post. */
function seoFor(blog) {
  const seo = blog.seo || {};
  const description = seo.description || blog.subtitle || excerpt(blog.description, 160);
  const keywords = seo.keywords?.length ? seo.keywords : blog.tags || [];
  return {
    title: seo.title || blog.title,
    description,
    keywords,
    image: seo.ogImage || blog.image,
    canonical: seo.canonicalUrl || blogPath(blog),
  };
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);
  if (!blog || !isPubliclyVisible(blog)) return { title: "Blog", robots: { index: false } };
  const s = seoFor(blog);
  return {
    title: s.title,
    description: s.description,
    keywords: s.keywords,
    alternates: { canonical: s.canonical },
    authors: [{ name: blog.author || "TPI CPC" }],
    openGraph: {
      type: "article",
      title: s.title,
      description: s.description,
      url: blogPath(blog),
      siteName: "TPI CPC",
      images: s.image ? [{ url: s.image, alt: blog.title }] : undefined,
      publishedTime: new Date(blog.approvedAt || blog.createdAt).toISOString(),
      modifiedTime: new Date(blog.updatedAt || blog.createdAt).toISOString(),
      authors: [blog.author || "TPI CPC"],
      tags: s.keywords,
    },
    twitter: {
      card: "summary_large_image",
      title: s.title,
      description: s.description,
      images: s.image ? [s.image] : undefined,
    },
  };
}

export default async function ViewBlogPage({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  // Pending/rejected posts (or anything we couldn't load server-side) are fetched on the
  // client with the viewer's token, so authors and admins can still preview them.
  if (!blog || !isPubliclyVisible(blog)) return <BlogPreviewFallback id={id} />;

  const [author, related] = await Promise.all([getAuthorInfo(blog), getRelated(blog)]);
  const html = sanitizeBlogHtml(blog.description);
  const plain = { ...blog, _id: String(blog._id), submittedBy: blog.submittedBy ? String(blog.submittedBy) : null };

  const s = seoFor(blog);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tpicpc.vercel.app";
  const abs = (u) => (u && u.startsWith("/") ? `${siteUrl}${u}` : u);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(s.canonical) },
    headline: s.title,
    description: s.description,
    image: s.image ? [s.image] : undefined,
    datePublished: new Date(blog.approvedAt || blog.createdAt).toISOString(),
    dateModified: new Date(blog.updatedAt || blog.createdAt).toISOString(),
    author: {
      "@type": author.isClub ? "Organization" : "Person",
      name: author.name,
      url: author.username ? `${siteUrl}/members/${author.username}` : undefined,
    },
    publisher: { "@type": "Organization", name: "TPI CPC", logo: { "@type": "ImageObject", url: `${siteUrl}/tpicpc_logo.png` } },
    keywords: s.keywords.join(", ") || undefined,
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: blog.likeCount || 0 },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: blog.commentCount || 0 },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ArticleView blog={plain} author={author} html={html} related={related} />
    </>
  );
}
