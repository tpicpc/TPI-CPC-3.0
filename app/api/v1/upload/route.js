import { fail, ok, serverError } from "@/lib/api-response";
import { uploadFormFileToImgBB, uploadToImgBB } from "@/lib/imgbb";
import { requireAuth, authError } from "@/lib/auth";

export async function POST(req) {
  try {
    const auth = requireAuth(req);
    if (auth.error) return authError(auth.error, auth.status);

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("image") || formData.get("file");
      if (!file) return fail("No image provided", 400);
      const url = await uploadFormFileToImgBB(file);
      return ok({ url });
    }

    const body = await req.json();
    if (!body?.image) return fail("No image provided", 400);
    const url = await uploadToImgBB(body.image, body.filename || "upload");
    return ok({ url });
  } catch (e) {
    return serverError(e);
  }
}

export const config = { api: { bodyParser: false } };
