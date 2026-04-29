export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tpicpc.vercel.app";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/profile"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
