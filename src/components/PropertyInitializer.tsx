"use client";

import * as React from "react";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useSession } from "next-auth/react";

export default function PropertyInitializer() {
  const { status } = useSession();
  const { isInitialized, setIsInitialized, refresh } = usePropertyStore();

  React.useEffect(() => {
    // Only fetch if authenticated and not already initialized
    if (status === "authenticated" && !isInitialized) {
      setIsInitialized(true);
      refresh();
    }
  }, [status, isInitialized, setIsInitialized, refresh]);

  // This component doesn't render anything
  return null;
}
