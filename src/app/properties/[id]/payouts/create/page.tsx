"use client";

import * as React from "react";
import { Box } from "@mui/material";
import PageHeader from "@/components/layout/PageHeader";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { createPayout } from "@/lib/actions/payout";
import PayoutForm, { PayoutItem } from "@/components/payouts/PayoutForm";

export default function CreatePayoutPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { setIsSaving, refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);

  const initialItems: PayoutItem[] = [
    { id: Date.now(), label: "Property Payout", amount: "", date: new Date() },
  ];

  const handleSubmit = async (items: PayoutItem[]) => {
    if (loading) return;
    setLoading(true);
    setIsSaving(true);
    try {
      for (const item of items) {
        if (!item.amount) continue;
        await createPayout({
          amount: parseFloat(item.amount),
          date: item.date.toISOString(),
          propertyId,
          name: item.label,
        });
      }
      await refresh();
      router.push(`/properties/${propertyId}/payouts`);
    } catch (error) {
      console.error("Failed to save payouts:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/properties/${propertyId}/payouts`);
  };

  return (
    <DashboardLayout width="md">
      <PageHeader
        title="Record Payouts"
        subtitle="Record one or more payouts for this property."
        onBack={handleCancel}
      />

      <PayoutForm
        initialItems={initialItems}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </DashboardLayout>
  );
}
