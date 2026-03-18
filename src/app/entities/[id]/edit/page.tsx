"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { getPendingToEntity, updatePendingToEntity } from "@/lib/actions/pending-to";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Loader from "@/components/Loader";
import EntityForm from "@/components/entities/EntityForm";

interface Entity {
  id: string;
  name: string;
  type: string | null;
}

export default function EditEntityPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [entity, setEntity] = React.useState<Entity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPendingToEntity(id);
        if (data) {
          setEntity(data as Entity);
        }
      } catch (error) {
        console.error("Failed to fetch entity:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data: { name: string; type: string }) => {
    setSubmitting(true);
    try {
      await updatePendingToEntity(id, data);
      router.push("/entities");
    } catch (error) {
      console.error("Failed to update entity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading entity details..." />
      </DashboardLayout>
    );
  }

  if (!entity) {
    router.push("/entities");
    return null;
  }

  return (
    <EntityForm
      initialData={{ name: entity.name, type: entity.type || "Person" }}
      onSubmit={handleSubmit}
      title="Edit Entity"
      description={`Update details for ${entity.name}.`}
      submitLabel="Save Changes"
      loading={submitting}
    />
  );
}
