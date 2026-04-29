import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import { isValidUsername } from "@/lib/validators";
import User from "@/models/User";

export async function PUT(req) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const updates = {};
    const allowed = ["fullName", "mobileNumber", "rollNumber", "department", "shift"];
    for (const f of allowed) {
      const v = formData.get(f);
      if (v !== null && v !== undefined && v !== "") updates[f] = v;
    }

    // Username — validated and uniqueness-checked
    const rawUsername = formData.get("username");
    if (rawUsername !== null && rawUsername !== undefined && rawUsername !== "") {
      const username = String(rawUsername).toLowerCase().trim();
      if (!isValidUsername(username)) {
        return fail("Username must be 3–24 characters, lowercase letters, numbers, or underscores", 400);
      }
      const existing = await User.findOne({ username, _id: { $ne: auth.user.id } }).select("_id").lean();
      if (existing) return fail("That username is already taken", 409);
      updates.username = username;
    }

    const file = formData.get("profileImage");
    if (file && typeof file !== "string") {
      try {
        updates.profileImage = await uploadFormFileToImgBB(file);
      } catch (err) {
        return fail("Image upload failed: " + err.message, 400);
      }
    }

    const user = await User.findByIdAndUpdate(auth.user.id, updates, { new: true })
      .select("-password -otp -otpExpiresAt -verifyOtp -verifyOtpExpiresAt")
      .lean();
    if (!user) return fail("User not found", 404);

    return ok({ user }, "Profile updated");
  } catch (e) {
    if (e.code === 11000 && e.keyPattern?.username) {
      return fail("That username is already taken", 409);
    }
    return serverError(e);
  }
}
