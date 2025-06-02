"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import SearchBox from "@/app/components/SearchBox";

export default function Home() {
  const { data: session, status } = useSession();

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
          <div className="flex justify-between">
            <p>Connected as {session?.user.email}</p>

            <button
              onClick={() => signOut()}
              className="w-56 border border-red-300 px-6 py-2 text-white"
            >
              Sign Out
            </button>
          </div>

          <SearchBox />
        </div>
      )}
    </div>
  );
}
