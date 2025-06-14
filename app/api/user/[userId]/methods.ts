import { AlbumToSave } from "@/app/components/SearchBox";

export async function saveAlbums(userId: string, albums: AlbumToSave[]) {
  const url = `/api/user/${userId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ albums }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update albums");
  }

  return res.json();
}
