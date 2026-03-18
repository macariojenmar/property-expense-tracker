"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createPendingToEntity } from "@/lib/actions/pending-to";
import EntityForm from "@/components/entities/EntityForm";

export default function CreateEntityPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (data: { name: string; type: string }) => {
    setSubmitting(true);
    try {
      await createPendingToEntity(data);
      router.push("/entities");
    } catch (error) {
      console.error("Failed to create entity:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <EntityForm
      onSubmit={handleSubmit}
      title="Add Entity"
      description="Create a new person or organization for pending expenses."
      submitLabel="Create Entity"
      loading={submitting}
    />
  );
}
