import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Resource from "@/models/Resource";

export async function GET(req) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const q = url.searchParams.get("q");

    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (q) filter.title = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const resources = await Resource.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    const categories = [...new Set((await Resource.find().distinct("category")) || [])];
    return ok({ resources, categories });
  } catch (e) {
    return serverError(e);
  }
}

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    if (!data.title || !data.category) return fail("Title and category required", 400);
    if (!data.fileUrl) return fail("Provide a download URL (Drive, Dropbox, GitHub, etc.)", 400);

    let thumbnailUrl = data.thumbnailUrl || "";
    const thumb = formData.getAll("thumbnail").find((e) => e && typeof e !== "string");
    if (thumb) {
      try { thumbnailUrl = await uploadFormFileToImgBB(thumb); }
      catch (e) { return fail("Thumbnail upload failed", 400); }
    }

    const resource = await Resource.create({
      title: data.title,
      description: data.description || "",
      fileUrl: data.fileUrl,
      fileType: data.fileType || "",
      fileSize: data.fileSize || "",
      thumbnailUrl,
      category: data.category,
      tags: data.tags ? JSON.parse(data.tags) : [],
      featured: data.featured === "true",
    });
    return ok({ resource }, "Resource added");
  } catch (e) {
    return serverError(e);
  }
}
