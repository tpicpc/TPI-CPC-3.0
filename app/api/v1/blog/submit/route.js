import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Blog from "@/models/Blog";
import User from "@/models/User";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const user = await User.findById(auth.user.id).select("fullName email emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) {
      return fail("Please verify your email before submitting a blog post", 403);
    }

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    if (!data.title || !data.description) return fail("Title and content are required", 400);
    if (data.description.replace(/<[^>]+>/g, "").trim().length < 100) {
      return fail("Content is too short — please write at least 100 characters", 400);
    }

    let image = data.image || "";
    const file = formData.getAll("image").find((e) => e && typeof e !== "string");
    if (file) {
      try {
        image = await uploadFormFileToImgBB(file);
      } catch (err) {
        return fail("Image upload failed: " + err.message, 400);
      }
    }
    if (!image) return fail("Cover image is required", 400);

    const blog = await Blog.create({
      title: data.title,
      description: data.description,
      image,
      author: user.fullName,
      tags: data.tags ? JSON.parse(data.tags) : [],
      status: "pending",
      submittedBy: user._id,
    });

    return ok(
      { blog: { _id: blog._id, status: blog.status } },
      "Thanks! Your blog has been submitted for review. You'll be notified once it's approved."
    );
  } catch (e) {
    return serverError(e);
  }
}
