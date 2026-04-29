import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import Certificate from "@/models/Certificate";
import Enrollment from "@/models/Enrollment";
import Event from "@/models/Event";
import User from "@/models/User";
import Workshop from "@/models/Workshop";

// Admin: list all certificates
export async function GET(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();
    const certs = await Certificate.find().sort({ issuedAt: -1 }).lean();
    return ok({ certificates: certs });
  } catch (e) {
    return serverError(e);
  }
}

// Admin: issue a certificate (for course completion or event participation)
export async function POST(req) {
  try {
    const auth = requireAuth(req, "admin");
    if (auth.error) return authError(auth.error, auth.status);
    await connectDB();

    const { userId, type, referenceId, grade } = await req.json();
    if (!["course", "event"].includes(type)) return fail("Invalid type", 400);
    if (!userId || !referenceId) return fail("userId and referenceId required", 400);

    const user = await User.findById(userId).select("fullName email").lean();
    if (!user) return fail("User not found", 404);

    let referenceTitle = "";
    let instructor = "";
    if (type === "course") {
      const ws = await Workshop.findById(referenceId).select("title instructor").lean();
      if (!ws) return fail("Course not found", 404);
      referenceTitle = ws.title;
      instructor = ws.instructor || "";
      // Verify enrollment exists
      const enr = await Enrollment.findOne({ user: userId, workshop: referenceId });
      if (!enr) return fail("User is not enrolled in this course", 400);
    } else {
      const ev = await Event.findById(referenceId).select("title organizer").lean();
      if (!ev) return fail("Event not found", 404);
      referenceTitle = ev.title;
      instructor = ev.organizer || "";
    }

    try {
      const cert = await Certificate.create({
        user: userId,
        recipientName: user.fullName,
        type,
        referenceId,
        referenceTitle,
        instructor,
        grade: grade || "",
        issuedBy: auth.user.id,
      });
      return ok({ certificate: cert }, "Certificate issued");
    } catch (err) {
      if (err.code === 11000) {
        const existing = await Certificate.findOne({ user: userId, type, referenceId }).lean();
        return ok({ certificate: existing, alreadyIssued: true }, "Certificate already exists");
      }
      throw err;
    }
  } catch (e) {
    return serverError(e);
  }
}
