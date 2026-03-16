"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft, Save } from "lucide-react";
import { updateExpense } from "@/lib/actions/expense";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import { useRouter, useParams } from "next/navigation";
import { usePropertyStore } from "@/store/usePropertyStore";
import ExpenseForm, { ExpenseFormData } from "@/components/expenses/ExpenseForm";
import Loader from "@/components/Loader";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const expenseId = params.expenseId as string;
  const { properties, setIsSaving, refresh, isLoading } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);
  const [initialized, setInitialized] = React.useState(false);

  const [item, setItem] = React.useState<ExpenseFormData | null>(null);
  const [entities, setEntities] = React.useState<{ id: string; name: string }[]>([]);
  const [dictionary, setDictionary] = React.useState<string[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("propertyTracker_dictionary");
    if (saved) {
      try {
        setDictionary(JSON.parse(saved));
      } catch { /* ignored */ }
    }

    const fetchEntities = async () => {
      try {
        const data = await getPendingToEntities();
        setEntities(data);
      } catch { /* ignored */ }
    };
    fetchEntities();
  }, []);

  React.useEffect(() => {
    if (properties.length > 0 && !initialized) {
      const property = properties.find((p) => p.id === propertyId);
      if (property) {
        const expense = property.expenses?.find((e) => e.id === expenseId);
        if (expense) {
          setItem({
            id: expense.id,
            name: expense.name,
            amount: String(expense.amount),
            date: new Date(expense.date),
            note: expense.note || "",
            status: expense.status as "PENDING" | "SETTLED",
            pendingToId: expense.pendingToId || "",
          });
          setInitialized(true);
        }
      }
    }
  }, [properties, propertyId, expenseId, initialized]);

  const handleChange = (
    id: string | number,
    field: keyof ExpenseFormData,
    value: string | Date | "PENDING" | "SETTLED",
  ) => {
    if (item) {
      setItem({ ...item, [field]: value });
    }
  };

  const handleSave = async () => {
    if (loading || !item) return;
    setLoading(true);
    setIsSaving(true);
    try {
      if (!item.name || !item.amount) return;
      await updateExpense(expenseId, {
        name: item.name,
        amount: parseFloat(item.amount),
        date: item.date.toISOString(),
        note: item.note,
        status: item.status,
        pendingToId: item.status === "PENDING" ? item.pendingToId : null,
      });
      await refresh();
      router.push(`/properties/${propertyId}/expenses`);
    } catch (error) {
      console.error("Failed to update expense:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  if (isLoading || !item) {
    return (
      <DashboardLayout>
        <Loader message="Loading expense details..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => router.push(`/properties/${propertyId}/expenses`)}
            size="small"
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Edit Expense</Typography>
            <Typography variant="body2" color="text.secondary">
              Update the details for this expense.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Expense Details</Typography>
              <ExpenseForm
                item={item}
                onChange={handleChange}
                entities={entities}
                dictionary={dictionary}
              />
            </CardContent>
          </Card>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 4 }}
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
              {loading ? "Saving..." : "Update Expense"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
