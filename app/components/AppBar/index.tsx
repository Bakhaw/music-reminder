"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu";
import { Button } from "@/app/components/ui/button";

function AppBar() {
  const { data: session } = useSession();

  if (!session?.user?.email) return null;

  return (
    <div className="flex justify-between">
      <Link href="/add-album">
        <Button variant="ghost" className="border">
          Add album +
        </Button>
      </Link>

      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{session.user.email}</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-red-500 focus:text-red-600"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default AppBar;
