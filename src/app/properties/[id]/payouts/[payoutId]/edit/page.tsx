"use client";

import * as React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { updatePayout, softDeletePayout } from "@/lib/actions/payout";
import PayoutForm, { PayoutItem } from "@/components/payouts/PayoutForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/layout/PageHeader";

export default function EditPayoutPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const payoutId = params.payoutId as string;
  const { properties, setIsSaving, refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);
  const [initialItems, setInitialItems] = React.useState<PayoutItem[] | null>(
    null,
  );
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    const property = properties.find((p) => p.id === propertyId);
    if (property) {
      const payout = property.payouts?.find((p) => p.id === payoutId);
      if (payout) {
        setInitialItems([
          {
            id: payout.id,
            label: payout.name || "Property Payout",
            amount: payout.amount.toString(),
            date: new Date(payout.date),
          },
        ]);
      } else {
        // Payout not found
        router.push(`/properties/${propertyId}/payouts`);
      }
    }
  }, [properties, propertyId, payoutId, router]);

  const handleSubmit = async (items: PayoutItem[]) => {
    if (loading || items.length === 0) return;
    const item = items[0]; // There should only be one item in edit mode
    if (!item.amount) return;

    setLoading(true);
    setIsSaving(true);
    try {
      await updatePayout(payoutId, {
        amount: parseFloat(item.amount),
        date: item.date.toISOString(),
        name: item.label,
      });
      await refresh();
      router.push(`/properties/${propertyId}/payouts`);
    } catch (error: any) {
      console.error("Failed to update payout:", error);
      alert(error.message || "Failed to update payout.");
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    setShowConfirm(false);

    setLoading(true);
    setIsSaving(true);
    try {
      await softDeletePayout(payoutId);
      await refresh();
      router.push(`/properties/${propertyId}/payouts`);
    } catch (error: any) {
      console.error("Failed to delete payout:", error);
      alert(error.message || "Failed to delete payout.");
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/properties/${propertyId}/payouts`);
  };

  if (!initialItems) return null; // Or a loading spinner

  return (
    <DashboardLayout width="md">
      <PageHeader
        title="Edit Payout"
        subtitle="Update details for this payout."
        onBack={handleCancel}
      />

      <PayoutForm
        initialItems={initialItems}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onDelete={() => setShowConfirm(true)}
        isEditing={true}
        loading={loading}
        title="Edit Payout Details"
        submitLabel="Update Payout"
      />

      <ConfirmDialog
        open={showConfirm}
        title="Delete Payout"
        message="Are you sure you want to delete this payout? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        loading={loading}
      />
    </DashboardLayout>
  );
}
