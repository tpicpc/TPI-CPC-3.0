import { FEATURES } from "@/lib/features";
import { NextResponse } from "next/server";

// Feature-flagged public pages. While a flag in lib/features.js is off, its routes
// respond with a real HTTP 404 (the layouts also call notFound() as a fallback).
const GATED = [{ prefix: "/leaderboard", feature: "leaderboard" }];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const gate = GATED.find((g) => pathname === g.prefix || pathname.startsWith(`${g.prefix}/`));
  if (gate && !FEATURES[gate.feature]) {
    return NextResponse.rewrite(new URL("/__feature-disabled", req.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/leaderboard", "/leaderboard/:path*"] };
