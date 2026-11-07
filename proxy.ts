import { NextResponse, type NextRequest } from "next/server";
import { publishedGuideAt } from "./lib/pilot";
import { indexingPolicy } from "./lib/seo-policy";

const noindexPaths = new Set([
  "/privacy",
  "/terms",
  "/thank-you",
  "/resource-download",
]);

/**
 * Replaces the Cloudflare Worker wrapper from the Sites build:
 * adds private cache hints and noindex headers for review, owner and utility
 * routes. The public site is noindex until launch is explicitly enabled.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  const protectedRoute =
    /^\/(answers|studio|api)(?:\/|$)/.test(pathname) ||
    (pathname.startsWith("/guides/") && !publishedGuideAt(pathname));
  const noindexRoute = protectedRoute || noindexPaths.has(pathname);
  const isOwnerRequest = request.cookies.has("mth_owner");

  if (protectedRoute || isOwnerRequest || pathname === "/blog") {
    response.headers.set("Cache-Control", "private, no-store");
  }

  if (noindexRoute || !indexingPolicy(process.env).indexing) {
    response.headers.set("X-Robots-Tag", "noindex");
  }

  return response;
}

export const config = {
  // Skip Next.js assets, image optimisation, Vercel internals and files with an extension.
  matcher: ["/((?!_next/static|_next/image|_vercel|.*\\..*).*)"],
};
