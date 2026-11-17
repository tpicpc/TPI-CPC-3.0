import { approvedBlogFilter } from "@/lib/blog-server";
import { connectDB } from "@/lib/db";
import { FEATURES } from "@/lib/features";
import Blog from "@/models/Blog";
import Workshop from "@/models/Workshop";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tpicpc.vercel.app";

  const staticPages = [
    "", "about", "teams", "events", "workshop", ...(FEATURES.leaderboard ? ["leaderboard"] : []),
    "blogs", "gallery", "contact", "faqs", "testimonials",
    "contests", "challenges", "learn", "notices", "calendar", "alumni", "jobs",
    "login", "signup",
  ].map((p) => ({
    url: `${baseUrl}/${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  let dynamicPages = [];
  try {
    await connectDB();
    const [blogs, workshops] = await Promise.all([
      Blog.find(approvedBlogFilter).select("_id slug updatedAt").lean(),
      Workshop.find({ status: "Published" }).select("slug updatedAt").lean(),
    ]);
    dynamicPages = [
      ...blogs.map((b) => ({
        url: `${baseUrl}/blogs/${b.slug || b._id}`,
        lastModified: b.updatedAt || new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      })),
      ...workshops.map((w) => ({
        url: `${baseUrl}/workshop/${w.slug}`,
        lastModified: w.updatedAt || new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      })),
    ];
  } catch {}

  return [...staticPages, ...dynamicPages];
}
