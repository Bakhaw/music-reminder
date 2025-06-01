"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  console.log({ session, status });

  return (
    <div className="flex flex-col items-center justify-center gap-8 h-screen">
      <button className="w-56 border border-red-300 px-6 py-2 text-white">
        <Link href="/sign-in">Sign In</Link>
      </button>
      <button className="w-56 border border-red-300 px-6 py-2 text-white">
        <Link href="/sign-up">Sign Up</Link>
      </button>
    </div>
  );
}
