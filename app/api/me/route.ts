import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    console.log("session", session);

    if (!session || !session.user.email) {
      return NextResponse.json(
        { user: null },
        { status: 401, statusText: "Not Authenticated" }
      );
    }

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        albums: true,
        email: true,
        id: true,
        image: true,
        username: true,
      },
    });

    if (!user)
      return NextResponse.json(
        { user: null },
        { status: 404, statusText: "User Not Found" }
      );

    return NextResponse.json(user, {
      status: 200,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 500,
        statusText: "Something went wrong",
      }
    );
  }
}
