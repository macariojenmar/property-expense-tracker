"use client";

import * as React from "react";
import {
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import { updatePayout } from "@/lib/actions/payout";
import PayoutForm, { PayoutItem } from "@/components/payouts/PayoutForm";

export default function EditPayoutPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const payoutId = params.payoutId as string;
  const { properties, setIsSaving, refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);
  const [initialItems, setInitialItems] = React.useState<PayoutItem[] | null>(null);

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

  const handleCancel = () => {
    router.push(`/properties/${propertyId}/payouts`);
  };

  if (!initialItems) return null; // Or a loading spinner

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={handleCancel}
            size="small"
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Edit Payout</Typography>
            <Typography variant="body2" color="text.secondary">
              Update details for this payout.
            </Typography>
          </Box>
        </Box>

        <PayoutForm
          initialItems={initialItems}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={true}
          loading={loading}
          title="Edit Payout Details"
          submitLabel="Update Payout"
        />
      </Box>
    </DashboardLayout>
  );
}
