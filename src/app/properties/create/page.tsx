"use client";

import * as React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter } from "next/navigation";
import { createProperty } from "@/lib/actions/property";
import { usePropertyStore } from "@/store/usePropertyStore";
import PropertyForm from "@/components/PropertyForm";

export default function CreatePropertyPage() {
  const router = useRouter();
  const { refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);

  const handleCreate = async (formData: any) => {
    setLoading(true);
    try {
      await createProperty(formData);
      await refresh();
      router.push("/properties");
    } catch (error) {
      throw error; // Let PropertyForm handle the error (e.g. LIMIT_REACHED → PricingDialog)
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout width="md">
      <PropertyForm
        onSubmit={handleCreate}
        loading={loading}
        submitLabel="Create Property"
        title="New Property"
        subtitle="Add details for your property listing."
      />
    </DashboardLayout>
  );
}
