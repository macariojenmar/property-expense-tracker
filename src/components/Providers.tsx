"use client";

import { SessionProvider } from "next-auth/react";
import PropertyInitializer from "./PropertyInitializer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PropertyInitializer />
      {children}
    </SessionProvider>
  );
}
