"use client";

import * as React from "react";
import PayoutsView from "@/components/payouts/PayoutsView";
import { useParams } from "next/navigation";

export default function PropertyPayoutsPage() {
  const params = useParams();
  const propertyId = typeof params.id === "string" ? params.id : null;

  return <PayoutsView propertyId={propertyId} />;
}
