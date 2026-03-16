"use client";

import * as React from "react";
import { usePropertyStore, Property } from "@/store/usePropertyStore";
import { getProperties } from "@/lib/actions/property";
import { useSession } from "next-auth/react";

export default function PropertyInitializer() {
  const { status } = useSession();
  const { isInitialized, setIsInitialized, setProperties, setIsLoading } = usePropertyStore();

  React.useEffect(() => {
    // Only fetch if authenticated and not already initialized
    if (status === "authenticated" && !isInitialized) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const data = await getProperties() as Property[];
          setProperties(data);
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to fetch properties in initializer:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [status, isInitialized, setIsInitialized, setProperties, setIsLoading]);

  // This component doesn't render anything
  return null;
}
