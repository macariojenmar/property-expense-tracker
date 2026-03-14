"use client";

import * as React from "react";
import ExpensesView from "@/components/expenses/ExpensesView";
import { useParams } from "next/navigation";

export default function PropertyExpensesPage() {
  const params = useParams();
  const propertyId = typeof params.id === "string" ? parseInt(params.id) : null;

  return <ExpensesView propertyId={propertyId} />;
}
