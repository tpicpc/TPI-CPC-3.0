import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Review from "@/models/Review";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const required = ["fullName", "semester", "shift", "reviewMessage", "department"];
    const missing = required.filter((f) => !data[f]);
    if (missing.length) return fail("Missing: " + missing.join(", "), 400);

    let profileImage = data.profileImage || "";
    const file = formData.get("profileImage");
    if (file && typeof file !== "string") {
      profileImage = await uploadFormFileToImgBB(file);
    }

    const review = await Review.create({
      fullName: data.fullName,
      semester: data.semester,
      shift: data.shift,
      reviewMessage: data.reviewMessage,
      department: data.department,
      profileImage,
      approved: false, // user-submitted reviews now require admin approval
    });
    return ok({ review }, "Thanks! Your review has been submitted for review.");
  } catch (e) {
    return serverError(e);
  }
}
