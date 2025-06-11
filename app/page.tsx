"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/app/api/me/methods";

import SearchBox from "@/app/components/SearchBox";
import AppBar from "@/app/components/AppBar";

export default function Home() {
  const { status } = useSession();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  console.log("me", me);

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
        <div className="p-6 min-h-screen flex flex-col gap-4">
          <AppBar />
          <SearchBox />
        </div>
      )}
    </div>
  );
}
