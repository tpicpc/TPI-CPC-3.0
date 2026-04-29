import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Blog from "@/models/Blog";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    if (!data.title || !data.description) return fail("title and description required", 400);

    let image = data.image || "";
    const file = formData.get("image");
    if (file && typeof file !== "string") {
      image = await uploadFormFileToImgBB(file);
    }
    if (!image) return fail("Cover image required", 400);

    const blog = await Blog.create({
      title: data.title,
      description: data.description,
      image,
      author: data.author || "TPI CPC",
      tags: data.tags ? JSON.parse(data.tags) : [],
      status: "approved",
      approvedAt: new Date(),
    });
    return ok({ blog }, "Blog published");
  } catch (e) {
    return serverError(e);
  }
}
