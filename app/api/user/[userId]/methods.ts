import { AlbumToSave } from "@/app/components/SearchBox";

export async function saveAlbum(userId: string, album: AlbumToSave) {
  const url = `/api/user/${userId}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ album }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update albums");
  }

  return res.json();
}

export async function deleteAlbum(userId: string, albumId: string) {
  const url = `/api/user/${userId}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ albumId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete album");
  }

  return res.json();
}
