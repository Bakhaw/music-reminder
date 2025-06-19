"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Loader2, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

import { getMe } from "@/app/api/me/methods";
import { ME_QUERY_KEY } from "@/app/lib/queries";

import Collection from "@/app/components/Collection";
import SearchBox from "@/app/components/SearchBox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import AppBar from "./components/AppBar";

function Home() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState("search");

  const { data: me, isLoading: isLoadingMe } = useQuery({
    queryKey: [ME_QUERY_KEY],
    queryFn: getMe,
  });

  if (status === "loading" || isLoadingMe)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-7 w-7 animate-spin" />
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
        <>
          <AppBar />

          <div className="text-center my-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Music Reminder 💜
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Save albums you want to listen to later
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
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

            <TabsContent value="search" className="space-y-6">
              <SearchBox collection={me?.albums ?? []} />
            </TabsContent>

            <TabsContent value="collection" className="space-y-6">
              <Collection
                collection={me?.albums ?? []}
                onEmptyButtonClick={() => setActiveTab("search")}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export default Home;
