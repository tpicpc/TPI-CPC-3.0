import { NextResponse } from "next/server";

export function ok(data = {}, message = "Success") {
  return NextResponse.json({ success: true, message, ...data });
}

export function fail(message = "Something went wrong", status = 400, extra = {}) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

export function serverError(err) {
  console.error("API error:", err);
  return NextResponse.json(
    { success: false, message: err?.message || "Server error" },
    { status: 500 }
  );
}
