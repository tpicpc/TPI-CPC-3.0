import { fail, ok, withAuth } from "@/lib/crud";
import Certificate from "@/models/Certificate";
import User from "@/models/User";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Member: my certificates + what appears on my public profile.
export const GET = withAuth("user", async (_req, _ctx, me) => {
  const [user, certificates] = await Promise.all([
    User.findById(me.id).select("showCertificates").lean(),
    Certificate.find({ user: me.id }).sort({ issuedAt: -1 }).select("number type referenceTitle issuedAt hiddenOnProfile").lean(),
  ]);
  if (!user) return fail("User not found", 404);
  return ok({ showCertificates: user.showCertificates !== false, certificates });
});

// PATCH { showCertificates: bool } → whole section; { id, hidden: bool } → one certificate.
export const PATCH = withAuth("user", async (req, _ctx, me) => {
  const body = await req.json();
  if (typeof body.showCertificates === "boolean") {
    await User.updateOne({ _id: me.id }, { $set: { showCertificates: body.showCertificates } });
    return ok({ showCertificates: body.showCertificates }, body.showCertificates ? "Certificates are visible on your profile" : "Certificates section hidden");
  }
  if (body.id && typeof body.hidden === "boolean") {
    if (!mongoose.isValidObjectId(body.id)) return fail("Invalid certificate", 400);
    const cert = await Certificate.findOneAndUpdate({ _id: body.id, user: me.id }, { $set: { hiddenOnProfile: body.hidden } }, { new: true })
      .select("number referenceTitle hiddenOnProfile").lean();
    if (!cert) return fail("Certificate not found", 404);
    return ok({ certificate: cert }, body.hidden ? "Hidden from your profile" : "Shown on your profile");
  }
  return fail("Nothing to update", 400);
});
