"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AlbumDetailed } from "ytmusic-api";

import { searchFromYtbmusicApi } from "@/app/api/search/methods";
import useDebounce from "@/app/hooks/useDebounce";

function SearchBox() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce([searchQuery], 500);

  const { data: albums } = useQuery<AlbumDetailed[] | undefined>({
    queryKey: ["albums", ...debouncedQuery],
    queryFn: () => searchFromYtbmusicApi(`${debouncedQuery[0]}`),
    enabled: Boolean(debouncedQuery[0]),
  });

  return (
    <div className="p-4 h-full flex flex-col items-center gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="search-input">Search</label>
        <input
          className="text-black"
          id="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ul className="grid grid-cols-2 gap-4">
        {albums?.map((album) => (
          <div key={album.albumId}>
            <p className="line-clamp-1">{album.name}</p>

            <Image
              alt={album.name}
              src={album.thumbnails[3].url}
              height={album.thumbnails[3].height}
              width={album.thumbnails[3].width}
            />
          </div>
        ))}
      </ul>
    </div>
  );
}

export default SearchBox;
