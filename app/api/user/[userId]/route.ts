import { NextResponse } from "next/server";
import * as z from "zod";

import { db } from "@/app/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const updateAlbumsSchema = z.object({
    albums: z.array(z.string(), z.string()).optional(),
  });

  try {
    const body = await req.json();
    const { userId } = params;
    const { albums } = updateAlbumsSchema.parse(body);

    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        albums: albums ?? [],
      },
    });

    const { password, ...safeUser } = updatedUser;

    return NextResponse.json(
      {
        message: "Albums updated successfully",
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update albums",
        error,
      },
      { status: 500 }
    );
  }
}
