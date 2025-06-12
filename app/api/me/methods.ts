import { signOut } from "next-auth/react";

import { AlbumToSave } from "@/app/components/SearchBox";

type Me = {
  albums: AlbumToSave[];
  createdAt: string;
  email: string;
  id: string;
  image: string;
  updatedAt: string;
  username: string;
};

type Response = Me | undefined;

export async function getMe(): Promise<Response> {
  const res = await fetch("/api/me");
  const json = await res.json();

  if (res.status === 404) {
    signOut({ callbackUrl: "/sign-in" });
  }

  return json;
}
