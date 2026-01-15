"use server";

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname, origin } = req.nextUrl;

  // Prevent authenticated users from visiting auth pages
  if ((pathname === "/sign-in" || pathname === "/sign-up") && token !== null) {
    return NextResponse.redirect(origin);
  }

  // Allow auth routes or any authenticated request
  if (pathname.includes("api/auth") || token) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up"],
};
