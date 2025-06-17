"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/app/api/me/methods";
import { deleteAlbum } from "@/app/api/user/[userId]/methods";
import { Button } from "@/app/components/ui/button";

function Home() {
  const { status } = useSession();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  async function removeFromSavedAlbums(albumId: string) {
    if (!me) return;

    const data = await deleteAlbum(me.id, albumId);
    console.log("album deleted:", albumId);
    console.log("new albums:", data);
  }

  if (status === "loading")
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading ...</p>
      </div>
    );

  return (
    <div>
      {status === "unauthenticated" ? (
        <div className="flex flex-col items-center justify-center gap-8 h-screen">
          <Link href="/sign-in">
            <button className="w-56 border border-red-300 px-6 py-2 text-white">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="w-56 border border-red-300 px-6 py-2 text-white">
              Sign Up
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <h1 className="text-xl">Welcome, {me?.username} !</h1>

          <ul className="flex flex-col gap-4">
            {me?.albums.map((album) => (
              <li key={album.id} className="flex justify-between">
                <div className="flex gap-4">
                  <Image
                    alt={album.name}
                    src={album.cover}
                    height={90}
                    width={90}
                  />

                  <div className="flex flex-col">
                    <span>{album.name}</span>
                    <span>{album.artist}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => removeFromSavedAlbums(album.id)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
