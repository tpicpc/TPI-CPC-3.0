import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Workshop from "@/models/Workshop";

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
}

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let data;
    let imageUrl = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
      data.lessons = data.lessons ? JSON.parse(data.lessons) : [];
      data.tags = data.tags ? JSON.parse(data.tags) : [];
      const file = formData.get("thumbnail");
      if (file && typeof file !== "string") imageUrl = await uploadFormFileToImgBB(file);
      else imageUrl = data.thumbnail || "";
    } else {
      data = await req.json();
      imageUrl = data.thumbnail || "";
    }

    if (!data.title || !data.description || !data.instructor) return fail("title, description, instructor required", 400);
    if (!imageUrl) return fail("Thumbnail required", 400);

    const baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    let slug = baseSlug;
    let n = 1;
    while (await Workshop.findOne({ slug })) {
      slug = `${baseSlug}-${n++}`;
    }

    const workshop = await Workshop.create({
      title: data.title,
      slug,
      description: data.description,
      thumbnail: imageUrl,
      instructor: data.instructor,
      category: data.category || "General",
      level: data.level || "Beginner",
      tags: data.tags || [],
      playlistUrl: data.playlistUrl || "",
      lessons: data.lessons || [],
      status: data.status || "Draft",
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      featured: data.featured === true || data.featured === "true",
    });

    return ok({ workshop }, "Workshop created");
  } catch (e) {
    return serverError(e);
  }
}
