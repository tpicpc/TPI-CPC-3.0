import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Advisor from "@/models/Advisor";

export async function GET() {
  try {
    await connectDB();
    const advisors = await Advisor.find().sort({ order: 1, createdAt: -1 }).lean();
    return ok({ advisors });
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
    if (!data.name || !data.position) return fail("name and position required", 400);

    let advisorProfile = data.advisorProfile || "";
    const file = formData.get("advisorProfile");
    if (file && typeof file !== "string") {
      advisorProfile = await uploadFormFileToImgBB(file);
    }

    const advisor = await Advisor.create({
      name: data.name,
      position: data.position,
      advisorProfile,
      gender: data.gender || "",
      order: Number(data.order || 0),
    });
    return ok({ advisor }, "Advisor added");
  } catch (e) {
    return serverError(e);
  }
}
