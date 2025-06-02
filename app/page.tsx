"use client";

import { useQuery } from "@tanstack/react-query";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { AlbumDetailed } from "ytmusic-api";

import { searchFromYtbmusicApi } from "@/app/api/search/methods";
import useDebounce from "@/app/hooks/useDebounce";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedQuery = useDebounce([searchQuery], 500);

  const { data: albums } = useQuery<AlbumDetailed[] | undefined>({
    queryKey: ["albums", ...debouncedQuery],
    queryFn: () => searchFromYtbmusicApi(`${debouncedQuery[0]}`),
    enabled: Boolean(debouncedQuery[0]),
  });

  console.log("albums", albums);

  if (status === "loading")
    return (
      <div className="h-screen flex justify-center items-center">
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
        <div className="p-6">
          <div className="flex justify-between">
            <p>Connected as {session?.user.email}</p>

            <button
              onClick={() => signOut()}
              className="w-56 border border-red-300 px-6 py-2 text-white"
            >
              Sign Out
            </button>
          </div>

          <div>
            <label htmlFor="search-input">Search</label>
            <input
              className="text-black"
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
