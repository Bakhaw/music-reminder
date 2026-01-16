import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/app/lib/db";
import { AlbumToSave } from "@/app/components/SearchBox";

const albumToSaveSchema = z.object({
  id: z.string(),
  name: z.string(),
  artist: z.string(),
  cover: z.string(),
  year: z.number().nullable(),
});

const updateAlbumsSchema = z.object({
  album: albumToSaveSchema,
});

const deleteAlbumSchema = z.object({
  albumId: z.string(),
});

// Helper to extract userId from URL path /api/user/[userId]
function extractUserId(url: string) {
  const pathname = new URL(url).pathname;
  const parts = pathname.split("/");
  // Assumes the last segment is userId: e.g. /api/user/abc123
  return parts[parts.length - 1];
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = extractUserId(req.url);

    const body = await req.json();
    const { album } = updateAlbumsSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { albums: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingAlbums = (user.albums ?? []) as Array<AlbumToSave>;

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        albums: [album, ...existingAlbums],
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

export async function DELETE(req: NextRequest) {
  try {
    const userId = extractUserId(req.url);

    const body = await req.json();
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
