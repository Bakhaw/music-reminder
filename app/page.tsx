"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { getMe } from "@/app/api/me/methods";
import { ME_QUERY_KEY } from "@/app/lib/queries";

import AppBar from "@/app/components/AppBar";
import { Button } from "@/app/components/ui/button";
import Collection from "@/app/components/Collection";
import SearchBox from "@/app/components/SearchBox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

function Home() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: me, isLoading: isLoadingMe } = useQuery({
    queryKey: [ME_QUERY_KEY],
    queryFn: getMe,
    enabled: status === "authenticated",
  });

  if (status === "loading" || isLoadingMe)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {status === "unauthenticated" ? (
        <div className="flex flex-col items-center justify-center gap-8 h-full">
          <Link href="/sign-in">
            <Button variant="outline" className="w-56">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="outline" className="w-56">
              Sign Up
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppBar />

          <div className="text-center my-4 px-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Music Reminder 💜
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Save albums you want to listen to later
            </p>
          </div>
          <div className="flex-1 px-2 pb-3 flex flex-col overflow-hidden min-h-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex-1 flex flex-col overflow-hidden min-h-0"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Albums
                </TabsTrigger>
                <TabsTrigger
                  value="collection"
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  My Collection ({me?.albums.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="search"
                forceMount
                className="flex flex-col overflow-hidden min-h-0 data-[state=inactive]:hidden"
              >
                <div className="flex flex-col gap-4 overflow-hidden min-h-0">
                  <SearchBox
                    collection={me?.albums ?? []}
                    resultsScrollAreaClassName="overflow-y-auto h-full pr-1"
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="collection"
                forceMount
                className="flex-1 flex flex-col overflow-hidden min-h-0 data-[state=inactive]:hidden"
              >
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                    <Collection
                      collection={me?.albums ?? []}
                      onEmptyButtonClick={() => setActiveTab("search")}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
