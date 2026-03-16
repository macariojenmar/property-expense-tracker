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
      console.error("Failed to create property:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <PropertyForm
        onSubmit={handleCreate}
        loading={loading}
        submitLabel="Create Property"
        title="Create New Property"
        subtitle="Add details for your property listing."
      />
    </DashboardLayout>
  );
}
