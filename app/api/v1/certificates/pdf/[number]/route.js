import { connectDB } from "@/lib/db";
import { fail, serverError } from "@/lib/api-response";
import { renderCertificatePdf } from "@/lib/certificate-pdf";
import Certificate from "@/models/Certificate";

export const dynamic = "force-dynamic";

// Public (by certificate number, same as the verify page): downloadable PDF
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { number } = await params;
    const cert = await Certificate.findOne({ number }).lean();
    if (!cert) return fail("Certificate not found", 404);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const bytes = await renderCertificatePdf(cert, { baseUrl });
    const inline = new URL(req.url).searchParams.get("inline") === "1";
    const fname = `TPI-CPC-Certificate-${cert.number}.pdf`;
    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fname}"`,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (e) {
    return serverError(e);
  }
}
