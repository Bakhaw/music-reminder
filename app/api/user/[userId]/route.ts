import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/app/lib/db";
import { AlbumToSave } from "@/app/components/SearchBox";

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

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { albums: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingAlbums = (user.albums ?? []) as Array<AlbumToSave>;
    const newAlbums = albums ?? [];

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        albums: [...existingAlbums, ...newAlbums],
      },
      select: {
        albums: true,
        email: true,
        id: true,
        image: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        message: "Albums updated successfully",
        user: updatedUser,
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

const deleteAlbumSchema = z.object({
  albumId: z.string(),
});

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json();
    const { userId } = params;

    const { albumId } = deleteAlbumSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { albums: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingAlbums = (user.albums ?? []) as Array<AlbumToSave>;

    const updatedAlbums = existingAlbums.filter(
      (album) => album.id !== albumId
    );

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        albums: updatedAlbums,
      },
      select: {
        albums: true,
        email: true,
        id: true,
        image: true,
        username: true,
      },
    });

    return NextResponse.json(
      {
        message: "Albums deleted successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /users/:userId/albums error:", error);

    return NextResponse.json(
      {
        message: "Failed to delete albums",
        error: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
