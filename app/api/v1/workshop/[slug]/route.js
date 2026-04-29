import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import Enrollment from "@/models/Enrollment";
import Workshop from "@/models/Workshop";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    const workshop = await Workshop.findOne({ slug }).lean();
    if (!workshop) return fail("Course not found", 404);

    workshop.lessons = (workshop.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    let enrolled = false;
    const token = getTokenFromRequest(req);
    if (token) {
      const payload = verifyToken(token);
      if (payload?.id && payload.role === "user") {
        const e = await Enrollment.findOne({ user: payload.id, workshop: workshop._id }).lean();
        enrolled = !!e;
      }
    }

    if (workshop.status === "Published" && !enrolled) {
      workshop.lessons = workshop.lessons.map((l) => ({
        _id: l._id,
        title: l.title,
        duration: l.duration,
        order: l.order,
      }));
      delete workshop.playlistUrl;
    }

    return ok({ workshop, enrolled });
  } catch (e) {
    return serverError(e);
  }
}
