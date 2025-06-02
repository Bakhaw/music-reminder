import { NextRequest, NextResponse } from "next/server";
import YTMusic from "ytmusic-api";

let ytmusic: YTMusic | null = null;

async function getYTMusicInstance() {
  if (!ytmusic) {
    ytmusic = new YTMusic();
    await ytmusic.initialize();
  }
  return ytmusic;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "query parameter missing" },
      { status: 400 }
    );
  }

  try {
    const ytmusic = await getYTMusicInstance();
    const results = await ytmusic.searchAlbums(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json(
      { error: error || "Erreur YTMusic API" },
      { status: 500 }
    );
  }
}
