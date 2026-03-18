"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Save } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { createExpense } from "@/lib/actions/expense";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import { getDictionaryWords } from "@/lib/actions/dictionary";
import { useRouter, useParams } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import ExpenseForm, {
  ExpenseFormData,
} from "@/components/expenses/ExpenseForm";

interface Word {
  id: string;
  word: string;
}

export default function CreateExpensePage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { setIsSaving, refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);

  const [items, setItems] = React.useState<ExpenseFormData[]>([
    {
      id: Date.now(),
      name: "",
      amount: "",
      date: new Date(),
      note: "",
      status: "SETTLED",
      pendingToId: "",
    },
  ]);
  const [entities, setEntities] = React.useState<
    { id: string; name: string }[]
  >([]);
  const [dictionary, setDictionary] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [dictionaryData, entitiesData] = await Promise.all([
          getDictionaryWords(),
          getPendingToEntities(),
        ]);
        setDictionary(dictionaryData.map((w: Word) => w.word));
        setEntities(entitiesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddRow = () =>
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        amount: "",
        date: new Date(),
        note: "",
        status: "SETTLED",
        pendingToId: "",
      },
    ]);

  const handleRemove = (id: string | number) =>
    setItems(items.filter((i) => i.id !== id));

  const handleChange = (
    id: string | number,
    field: keyof ExpenseFormData,
    value: string | Date | "PENDING" | "SETTLED" | "DELETED",
  ) => setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    setIsSaving(true);
    try {
      for (const item of items) {
        if (!item.name || !item.amount) continue;
        await createExpense({
          name: item.name,
          amount: parseFloat(item.amount),
          date: item.date.toISOString(),
          note: item.note,
          propertyId,
          status: item.status === "DELETED" ? "SETTLED" : item.status, // Fallback for safety, should never be DELETED on create
          pendingToId: item.status === "PENDING" ? item.pendingToId : undefined,
        });
      }
      await refresh();
      router.push(`/properties/${propertyId}/expenses`);
    } catch (error) {
      console.error("Failed to save expenses:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <PageHeader
          title="New Expenses"
          subtitle="Record one or more expenses for this property."
          onBack={() => router.push(`/properties/${propertyId}/expenses`)}
        />

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>
                Expense Details
              </Typography>
              <Stack spacing={3}>
                {items.map((item, index) => (
                  <ExpenseForm
                    key={item.id}
                    item={item}
                    index={index}
                    showIndex={items.length > 1}
                    onRemove={items.length > 1 ? handleRemove : undefined}
                    onChange={handleChange}
                    entities={entities}
                    dictionary={dictionary}
                  />
                ))}
                <Button
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={handleAddRow}
                  size="small"
                  sx={{ width: { xs: "100%", sm: "fit-content" } }}
                >
                  Add Row
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="flex-end"
            gap={2}
          >
            <Button
              variant="outlined"
              onClick={() => router.push(`/properties/${propertyId}/expenses`)}
              sx={{ borderRadius: 1.5, px: 3 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? null : <Save size={18} />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                borderRadius: 1.5,
                px: 3,
                bgcolor: "text.primary",
                color: "background.paper",
                "&:hover": { bgcolor: "primary.main", opacity: 0.9 },
              }}
            >
              {loading ? "Saving..." : "Save Expenses"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
