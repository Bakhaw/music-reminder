import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
  });

  const { pathname, origin } = req.nextUrl;

  if ((pathname === "/sign-in" || pathname === "/sign-up") && token !== null) {
    return NextResponse.redirect(origin);
  }

  if (pathname.includes("api/auth") || token) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/sign-in", "/sign-up"],
};
