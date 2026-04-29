import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB } from "@/lib/imgbb";
import Team from "@/models/Team";

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find().sort({ year: -1, order: 1 }).lean();
    return ok({ teams });
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
    if (!data.name || !data.position || !data.year) return fail("name, position, and year are required", 400);

    let memberProfile = data.memberProfile || "";
    const file = formData.get("memberProfile");
    if (file && typeof file !== "string") {
      memberProfile = await uploadFormFileToImgBB(file);
    }

    const team = await Team.create({
      name: data.name,
      position: data.position,
      year: Number(data.year),
      memberProfile,
      gender: data.gender || "",
      bio: data.bio || "",
      email: data.email || "",
      mobileNumber: data.mobileNumber || "",
      rollNumber: data.rollNumber || "",
      department: data.department || "",
      shift: data.shift || "",
      session: data.session || "",
      facebook: data.facebook || "",
      linkedin: data.linkedin || "",
      github: data.github || "",
      order: Number(data.order || 0),
    });

    return ok({ team }, "Team member added");
  } catch (e) {
    return serverError(e);
  }
}
