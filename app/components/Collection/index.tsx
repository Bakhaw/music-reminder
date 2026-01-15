import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Music, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

import { deleteAlbum } from "@/app/api/user/[userId]/methods";
import { ME_QUERY_KEY } from "@/app/lib/queries";

import { AlbumToSave } from "../SearchBox";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type CollectionProps = {
  collection: AlbumToSave[];
  onEmptyButtonClick: () => void;
};

function Collection({ collection, onEmptyButtonClick }: CollectionProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutate: deleteAlbumMutation, isPending: isDeletingAlbum } =
    useMutation({
      mutationFn: (albumId: string) => {
        if (!session) throw new Error("Not authenticated");

        setDeletingId(albumId);
        return deleteAlbum(session.user.id, albumId);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [ME_QUERY_KEY] });
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });

  function clearCollection() {
    //
  }

  return (
    <>
      {collection.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Your collection is empty</p>
            <p className="text-sm text-gray-400">
              Search for albums and add them to your collection
            </p>
            <Button
              onClick={onEmptyButtonClick}
              variant="outline"
              className="mt-4"
            >
              Start Searching
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <Card className="flex-shrink-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Collection</CardTitle>
                  <CardDescription>
                    Albums you want to listen to ({collection.length} albums)
                  </CardDescription>
                </div>
                {collection.length > 0 && (
                  <Button onClick={clearCollection} variant="outline" size="sm">
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {collection.map((album) => (
            <Card
              key={album.id}
              className="hover:shadow-md transition-shadow group aria-disabled:pointer-events-none aria-disabled:opacity-50"
              aria-disabled={isDeletingAlbum && deletingId === album.id}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={album.cover || "/placeholder.svg"}
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
                        <p className="text-gray-600 mb-2">{album.artist}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{album.year}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => deleteAlbumMutation(album.id)}
                        size="sm"
                        variant="secondary"
                        disabled={isDeletingAlbum && deletingId === album.id}
                        className="flex-shrink-0"
                      >
                        {isDeletingAlbum && deletingId === album.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
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

export default Collection;
