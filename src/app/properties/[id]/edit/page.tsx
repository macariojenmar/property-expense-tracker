"use client";

import * as React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useRouter, useParams } from "next/navigation";
import { getProperty, updateProperty } from "@/lib/actions/property";
import { usePropertyStore } from "@/store/usePropertyStore";
import Loader from "@/components/Loader";
import PropertyForm from "@/components/PropertyForm";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { refresh } = usePropertyStore();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [propertyData, setPropertyData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProperty(id);
        if (data) {
          setPropertyData({
            name: data.name,
            location: data.location || "",
            initialFunds: String(data.initialFunds || 0),
            recurringExpenses: data.recurringExpenses.map((re: any) => ({
              id: re.id,
              name: re.name,
              amount: String(re.amount),
              day: re.day,
              pendingToId: re.pendingToId || ""
            }))
          });
        }
      } catch (error) {
        console.error("Failed to fetch property data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (formData: any) => {
    setSaving(true);
    try {
      await updateProperty(id, formData);
      await refresh();
      router.push(`/properties/${id}`);
    } catch (error) {
      console.error("Failed to update property:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading property details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout width="md">
      <PropertyForm
        initialData={propertyData}
        onSubmit={handleUpdate}
        loading={saving}
        submitLabel="Save Changes"
        title="Edit Property"
        subtitle={`Update details for ${propertyData?.name}.`}
      />
    </DashboardLayout>
  );
}
