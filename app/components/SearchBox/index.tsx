"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
};

function SearchBox({ collection }: SearchBoxProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce([searchQuery], 500);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { data: albums, isFetching: isSearching } = useQuery<
    AlbumDetailed[] | undefined
  >({
    queryKey: ["search", ...debouncedQuery],
    queryFn: () => searchFromYtbmusicApi(`${debouncedQuery[0]}`),
    enabled: Boolean(debouncedQuery[0]),
  });

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
    <>
      <Card>
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
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Searching albums...</p>
          </CardContent>
        </Card>
      )}

      {!isSearching && albums !== undefined && albums.length > 0 && (
        <div className="space-y-3">
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
    </>
  );
}

export default SearchBox;
