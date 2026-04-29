import { connectDB } from "@/lib/db";
import { fail, ok, serverError } from "@/lib/api-response";
import Certificate from "@/models/Certificate";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { number } = await params;
    const cert = await Certificate.findOne({ number }).lean();
    if (!cert) return fail("Certificate not found", 404);
    return ok({
      certificate: {
        number: cert.number,
        recipientName: cert.recipientName,
        type: cert.type,
        referenceTitle: cert.referenceTitle,
        instructor: cert.instructor,
        grade: cert.grade,
        issuedAt: cert.issuedAt,
        valid: true,
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
