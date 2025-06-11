import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/app/lib/db";

const albumToSaveSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  cover: z.string(),
});

const updateAlbumsSchema = z.object({
  albums: z.array(albumToSaveSchema).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json();
    const { userId } = await params;

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
    console.error("PATCH /users/:userId/albums error:", error);

    return NextResponse.json(
      {
        message: "Failed to update albums",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
