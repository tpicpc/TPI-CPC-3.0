import { connectDB } from "@/lib/db";
import { fail, serverError } from "@/lib/api-response";
import Resource from "@/models/Resource";
import { NextResponse } from "next/server";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const r = await Resource.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
    if (!r) return fail("Not found", 404);
    return NextResponse.redirect(r.fileUrl);
  } catch (e) {
    return serverError(e);
  }
}
