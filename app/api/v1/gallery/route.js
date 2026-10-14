import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadToImgBBDetailed } from "@/lib/imgbb";
import GalleryImage from "@/models/GalleryImage";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const filter = category && category !== "all" ? { category } : {};
    const [images, categories] = await Promise.all([
      GalleryImage.find(filter).sort({ createdAt: -1 }).lean(),
      GalleryImage.distinct("category"),
    ]);
    return ok({ images, categories: categories.filter(Boolean).sort() });
  } catch (e) {
    return serverError(e);
  }
}

// Admin: upload one or more images (multipart field "images" or "image").
// Optional fields: title, caption, category (applied to every file in the request).
export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const files = [...formData.getAll("images"), ...formData.getAll("image")].filter(
      (f) => f && typeof f !== "string"
    );
    if (files.length === 0) return fail("No image provided", 400);
    if (files.length > 20) return fail("Upload at most 20 images at a time", 400);

    const meta = {
      title: String(formData.get("title") || "").slice(0, 200),
      caption: String(formData.get("caption") || "").slice(0, 1000),
      category: String(formData.get("category") || "").slice(0, 60),
    };

    const created = [];
    const errors = [];
    for (const file of files) {
      if (!file.type?.startsWith("image/")) {
        errors.push(`${file.name}: not an image`);
        continue;
      }
      try {
        const up = await uploadToImgBBDetailed(file, file.name);
        const doc = await GalleryImage.create({
          url: up.url,
          mediumUrl: up.mediumUrl,
          thumbUrl: up.thumbUrl,
          deleteUrl: up.deleteUrl,
          imgbbId: up.id,
          width: up.width,
          height: up.height,
          ...meta,
        });
        created.push(doc);
      } catch (e) {
        errors.push(`${file.name}: ${e.message}`);
      }
    }

    if (created.length === 0) return fail(errors[0] || "Upload failed", 400, { errors });
    return ok({ images: created, errors }, `${created.length} image(s) uploaded`);
  } catch (e) {
    return serverError(e);
  }
}
