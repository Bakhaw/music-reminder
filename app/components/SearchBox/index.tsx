"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AlbumDetailed } from "ytmusic-api";

import { searchFromYtbmusicApi } from "@/app/api/search/methods";
import { saveAlbums } from "@/app/api/user/[userId]/methods";
import useDebounce from "@/app/hooks/useDebounce";
import { cn } from "@/app/lib/utils";

import { Button } from "@/app/components/ui/button";

export type AlbumToSave = {
  id: string;
  name: string;
  artist: string;
  cover: string;
};

function SearchBox() {
  const { data: session } = useSession();
  const [selectedAlbums, setSelectedAlbums] = useState<Array<AlbumToSave>>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce([searchQuery], 500);

  const { data: albums } = useQuery<AlbumDetailed[] | undefined>({
    queryKey: ["albums", ...debouncedQuery],
    queryFn: () => searchFromYtbmusicApi(`${debouncedQuery[0]}`),
    enabled: Boolean(debouncedQuery[0]),
  });

  function toggleSelectAlbum(album: AlbumToSave) {
    setSelectedAlbums((prevSelected) => {
      const exists = prevSelected.some((a) => a.id === album.id);

      if (exists) {
        return prevSelected.filter((a) => a.id !== album.id);
      } else {
        return [...prevSelected, album];
      }
    });
  }

  async function saveSelection() {
    if (!session) return;

    try {
      const result = await saveAlbums(session.user.id, selectedAlbums);

      console.log("saveAlbums result:", result);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col gap-1 mt-6">
        <label htmlFor="search-input">Search</label>
        <input
          className="text-black"
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ul className="flex flex-col gap-4">
        {albums?.map((album) => {
          const isSelected = selectedAlbums.find(
            (alb) => alb.id === album.albumId
          );

          return (
            <button
              className={cn(
                "flex gap-2",
                isSelected && "bg-foreground text-background"
              )}
              key={album.albumId}
              onClick={() =>
                toggleSelectAlbum({
                  id: album.albumId,
                  name: album.name,
                  artist: album.artist.name,
                  cover: album.thumbnails[3].url,
                })
              }
            >
              <Image
                alt={album.name}
                src={album.thumbnails[3].url}
                height={60}
                width={60}
              />

              <div className="flex flex-col items-start">
                <span className="line-clamp-1">{album.name}</span>
                <span className="line-clamp-1">{album.artist.name}</span>
              </div>
            </button>
          );
        })}
      </ul>

      <Button
        className="bg-foreground text-background hover:bg-foreground"
        disabled={selectedAlbums.length === 0}
        onClick={saveSelection}
      >
        Add selection
      </Button>
    </div>
  );
}

export default SearchBox;
