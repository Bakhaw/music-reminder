"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Heart, Loader2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { AlbumDetailed } from "ytmusic-api";

import { searchFromYtbmusicApi } from "@/app/api/search/methods";
import { saveAlbum } from "@/app/api/user/[userId]/methods";
import useDebounce from "@/app/hooks/useDebounce";
import { ME_QUERY_KEY } from "@/app/lib/queries";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

export type AlbumToSave = {
  id: string;
  name: string;
  artist: string;
  cover: string;
  year: number | null;
};

type SearchBoxProps = {
  collection: AlbumToSave[];
  onSaved?: () => void;
  resultsScrollAreaClassName?: string;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
};

function SearchBox({
  collection,
  onSaved,
  resultsScrollAreaClassName,
  searchQuery: controlledSearchQuery,
  onSearchQueryChange,
}: SearchBoxProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [internalSearchQuery, setInternalSearchQuery] = useState("");
  const searchQuery = controlledSearchQuery ?? internalSearchQuery;
  const setSearchQuery = onSearchQueryChange ?? setInternalSearchQuery;
  const debouncedQuery = useDebounce<string>([searchQuery], 500);
  const [addingId, setAddingId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Store scroll positions per query key
  const scrollPositionsRef = useRef<Map<string, number>>(new Map());

  const { data: albums, isLoading: isSearching } = useQuery<
    AlbumDetailed[] | undefined
  >({
    queryKey: ["search", ...debouncedQuery],
    queryFn: () => searchFromYtbmusicApi(`${debouncedQuery[0]}`),
    enabled: Boolean(debouncedQuery[0]),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    gcTime: 10 * 60 * 1000, // Keep cache for 10 minutes
  });

  const currentQueryKey = debouncedQuery[0] || "";

  // Save scroll position when scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !currentQueryKey) return;

    const handleScroll = () => {
      scrollPositionsRef.current.set(currentQueryKey, container.scrollTop);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentQueryKey]);

  // Restore scroll position when component mounts or results are available
  useEffect(() => {
    if (!albums || albums.length === 0 || !currentQueryKey) return;

    const savedPosition = scrollPositionsRef.current.get(currentQueryKey) || 0;
    if (savedPosition === 0) return; // Don't restore if there's no saved position

    // Use a more robust approach to restore scroll
    const attemptRestore = () => {
      const container = scrollContainerRef.current;
      if (!container) {
        requestAnimationFrame(attemptRestore);
        return;
      }

      // Wait until container has content
      if (container.scrollHeight === 0) {
        requestAnimationFrame(attemptRestore);
        return;
      }

      // Restore the position
      container.scrollTop = savedPosition;
    };

    // Start restoration attempts
    requestAnimationFrame(attemptRestore);
  }, [albums, currentQueryKey]);

  const {
    mutate: addToCollectionMutation,
    isPending: isAddingAlbumToCollection,
  } = useMutation({
    mutationFn: async (album: AlbumToSave) => {
      if (!session) throw new Error("Not authenticated");

      setAddingId(album.id);
      return saveAlbum(session.user.id, album);
    },
    onSuccess: () => {
      onSaved?.();
      queryClient.invalidateQueries({ queryKey: [ME_QUERY_KEY] });
    },
    onSettled: () => {
      setAddingId(null);
    },
  });

  function isInCollection(albumId: string) {
    return collection.some((album) => album.id === albumId);
  }

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle>Search for Albums</CardTitle>
          <CardDescription>
            Find classic albums to add to your collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search albums, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              disabled={isSearching}
            />
          </div>
        </CardContent>
      </Card>

      {isSearching && (
        <Card className="flex-shrink-0">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Searching albums...</p>
          </CardContent>
        </Card>
      )}

      {!isSearching && albums !== undefined && albums.length > 0 && (
        <div
          ref={scrollContainerRef}
          className={clsx(
            "space-y-3",
            resultsScrollAreaClassName && resultsScrollAreaClassName
          )}
        >
          {albums.map((album) => (
            <Card
              key={album.albumId}
              className="hover:shadow-md transition-shadow group"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={album.thumbnails[3].url || "/placeholder.svg"}
                    alt={`${album.name} cover`}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      if (e.target instanceof HTMLImageElement) {
                        e.target.src = "/placeholder.svg?height=64&width=64";
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg leading-tight mb-1">
                          {album.name}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {album.artist.name}
                        </p>
                        <div className="text-sm text-gray-500">
                          <span>{album.year}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          addToCollectionMutation({
                            id: album.albumId,
                            name: album.name,
                            artist: album.artist.name,
                            cover: album.thumbnails[3].url,
                            year: album.year,
                          })
                        }
                        disabled={
                          isInCollection(album.albumId) ||
                          addingId === album.albumId
                        }
                        size="sm"
                        variant={
                          isInCollection(album.albumId)
                            ? "secondary"
                            : "default"
                        }
                        className="flex-shrink-0"
                      >
                        {isInCollection(album.albumId) ? (
                          <Heart className="h-4 w-4 fill-current" />
                        ) : isAddingAlbumToCollection &&
                          addingId === album.albumId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBox;
