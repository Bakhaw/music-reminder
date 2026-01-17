import type { Metadata } from "next";

import Providers from "@/app/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Music reminder",
  description: "Music reminder",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="mx-auto w-full max-w-2xl h-screen">
          <Providers>
            <div className="h-full flex flex-col">{children}</div>
          </Providers>
        </main>
      </body>
    </html>
  );
}
