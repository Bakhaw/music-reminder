"use client";

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

  if (!session?.user?.email) return null;

  return (
    <div className="flex justify-end py-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="uppercase rounded-full"
            size="icon"
          >
            {session.user.username[0]}
            {session.user.username[1]}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => signOut()}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default AppBar;
