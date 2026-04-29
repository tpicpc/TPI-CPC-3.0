import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import { passwordStrength } from "@/lib/validators";
import Admin from "@/models/Admin";

export async function PUT(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const formData = await req.formData();
    const updates = {};
    const name = formData.get("name");
    if (name) updates.name = name;

    const newPassword = formData.get("password");
    if (newPassword) {
      const pwd = passwordStrength(newPassword);
      if (!pwd.ok) return fail(pwd.message, 400);
      updates.password = await bcrypt.hash(newPassword, 10);
    }

    const file = formData.get("adminProfile");
    if (file && typeof file !== "string") {
      try {
        updates.adminProfile = await uploadFormFileToImgBB(file);
      } catch (err) {
        return fail("Image upload failed: " + err.message, 400);
      }
    }

    const admin = await Admin.findByIdAndUpdate(auth.user.id, updates, { new: true })
      .select("-password -otp -otpExpiresAt")
      .lean();
    if (!admin) return fail("Admin not found", 404);

    return ok({ admin }, "Profile updated");
  } catch (e) {
    return serverError(e);
  }
}
