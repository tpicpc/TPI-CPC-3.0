/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["mongoose", "bcryptjs", "harfbuzzjs"],
  // Bangla fonts used by the certificate PDF renderer (read from disk at runtime)
  outputFileTracingIncludes: {
    "/api/v1/certificates/pdf/[number]": ["./lib/fonts/**/*", "./node_modules/harfbuzzjs/dist/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "image.ibb.co" },
      { protocol: "https", hostname: "i.pinimg.com" },
      { protocol: "https", hostname: "tpicpc.vercel.app" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
