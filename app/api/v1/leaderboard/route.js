import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Leaderboard from "@/models/Leaderboard";

export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const contentType = req.headers.get("content-type") || "";
    let data, image = "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      data = Object.fromEntries(formData.entries());
      const file = formData.get("profileImage");
      if (file && typeof file !== "string") image = await uploadFormFileToImgBB(file);
      else image = data.profileImage || "";
    } else {
      data = await req.json();
      image = data.profileImage || "";
    }

    if (!data.name) return fail("name required", 400);

    const entry = await Leaderboard.create({
      name: data.name,
      department: data.department || "",
      rollNumber: data.rollNumber || "",
      profileImage: image,
      points: Number(data.points || 0),
      contributions: Number(data.contributions || 0),
      contestsWon: Number(data.contestsWon || 0),
      badge: data.badge || "",
      handle: data.handle || "",
      year: Number(data.year || new Date().getFullYear()),
    });
    return ok({ entry }, "Leaderboard entry added");
  } catch (e) {
    return serverError(e);
  }
}
