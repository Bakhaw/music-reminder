"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/app/components/ui/dropdown-menu";

function AppBar() {
  const { data: session } = useSession();
  const { back } = useRouter();
  const pathname = usePathname();

  if (!session?.user?.email) return null;

  return (
    <div className="flex justify-between">
      {pathname === "/" ? (
        <Link href="/add-album">
          <Button variant="outline">Add album +</Button>
        </Link>
      ) : (
        <Button variant="ghost" onClick={back}>
          Back
        </Button>
      )}

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
