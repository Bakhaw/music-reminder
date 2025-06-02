"use client";

import { SessionProvider } from "next-auth/react";
import QueryProvider from "./QueryProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <QueryProvider>{children}</QueryProvider>
    </SessionProvider>
  );
}

export default Providers;
