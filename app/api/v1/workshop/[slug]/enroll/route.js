import { connectDB } from "@/lib/db";
import { authError, requireAuth } from "@/lib/auth";
import { fail, ok, serverError } from "@/lib/api-response";
import { sendEnrollmentEmail } from "@/lib/mailer";
import Enrollment from "@/models/Enrollment";
import User from "@/models/User";
import Workshop from "@/models/Workshop";

export async function POST(req, { params }) {
  try {
    const auth = requireAuth(req, "user");
    if (auth.error) return authError(auth.error, auth.status);

    await connectDB();
    const { slug } = await params;

    const workshop = await Workshop.findOne({ slug }).lean();
    if (!workshop) return fail("Course not found", 404);
    if (workshop.status !== "Published") {
      return fail("This course isn't available for enrollment yet", 400);
    }

    const user = await User.findById(auth.user.id).select("fullName email emailVerified").lean();
    if (!user) return fail("User not found", 404);
    if (!user.emailVerified) {
      return fail("Please verify your email before enrolling", 403, { needsVerification: true });
    }

    // Idempotent: if already enrolled, just return success
    const existing = await Enrollment.findOne({ user: user._id, workshop: workshop._id });
    if (existing) {
      return ok({ alreadyEnrolled: true }, "You're already enrolled in this course");
    }

    const enrollment = await Enrollment.create({
      user: user._id,
      workshop: workshop._id,
    });

    // Fire and forget email — don't block the response if it fails
    sendEnrollmentEmail(user.email, user.fullName, workshop).catch((e) =>
      console.warn("Enrollment email failed:", e?.message || e)
    );

    return ok({ enrollment }, "Enrolled successfully — check your email");
  } catch (e) {
    return serverError(e);
  }
}
