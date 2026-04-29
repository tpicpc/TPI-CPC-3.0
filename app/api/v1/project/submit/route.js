import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Project from "@/models/Project";
import User from "@/models/User";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const user = await User.findById(auth.user.id).select("fullName email emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) return fail("Verify your email before submitting a project", 403);

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    if (!data.title || !data.description) return fail("Title and description required", 400);

    // Cover image
    let coverImage = "";
    const coverFile = formData.getAll("coverImage").find((e) => e && typeof e !== "string");
    if (coverFile) {
      try { coverImage = await uploadFormFileToImgBB(coverFile); }
      catch (err) { return fail("Cover image upload failed: " + err.message, 400); }
    }
    if (!coverImage) return fail("Cover image required", 400);

    // Up to 6 screenshots
    const screenshotFiles = formData.getAll("screenshots").filter((e) => e && typeof e !== "string").slice(0, 6);
    const screenshots = [];
    for (const file of screenshotFiles) {
      try { screenshots.push(await uploadFormFileToImgBB(file)); }
      catch (err) { console.warn("Screenshot upload failed:", err.message); }
    }

    const project = await Project.create({
      title: data.title,
      description: data.description,
      coverImage,
      screenshots,
      demoUrl: data.demoUrl || "",
      githubUrl: data.githubUrl || "",
      tags: data.tags ? JSON.parse(data.tags) : [],
      owner: user._id,
      status: "pending",
    });

    return ok(
      { project: { _id: project._id, status: project.status } },
      "Project submitted! It will appear publicly once an admin approves it."
    );
  } catch (e) {
    return serverError(e);
  }
}
