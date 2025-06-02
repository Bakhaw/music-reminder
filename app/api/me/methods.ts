import { signOut } from "next-auth/react";

export async function getMe() {
  const res = await fetch("/api/me");
  const json = await res.json();

  if (res.status === 404) {
    signOut({ callbackUrl: "/sign-in" });
  }

  return json;
}
