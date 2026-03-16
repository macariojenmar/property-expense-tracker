"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Stack,
  IconButton,
  InputAdornment,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { createExpense } from "@/lib/actions/expense";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import { useRouter, useParams } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { usePropertyStore } from "@/store/usePropertyStore";

interface ExpenseItem {
  id: number;
  name: string;
  amount: string;
  date: Date;
  note: string;
  status: "PENDING" | "SETTLED";
  pendingToId: string;
}

export default function CreateExpensePage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const { currency } = useCurrency();
  const { setIsSaving, refresh } = usePropertyStore();
  const [loading, setLoading] = React.useState(false);

  const [items, setItems] = React.useState<ExpenseItem[]>([
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
  const [entities, setEntities] = React.useState<{ id: string; name: string }[]>([]);
  const [dictionary, setDictionary] = React.useState<string[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("propertyTracker_dictionary");
    if (saved) {
      try {
        setDictionary(JSON.parse(saved));
      } catch { /* ignored */ }
    } else {
      const defaults = [
        "Internet",
        "Rent",
        "Transportation",
        "Water Bill",
        "Electricity Bill",
        "Cleaning Fee",
        "Maintenance",
        "Property Tax",
      ];
      setDictionary(defaults);
      localStorage.setItem(
        "propertyTracker_dictionary",
        JSON.stringify(defaults),
      );
    }

    const fetchEntities = async () => {
      try {
        const data = await getPendingToEntities();
        setEntities(data);
      } catch { /* ignored */ }
    };
    fetchEntities();
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

  const handleRemove = (id: number) =>
    setItems(items.filter((i) => i.id !== id));

  const handleChange = (id: number, field: string, value: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleDateChange = (id: number, value: Date | null) =>
    setItems(
      items.map((i) => (i.id === id ? { ...i, date: value || new Date() } : i)),
    );

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
          status: item.status,
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
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => router.push(`/properties/${propertyId}/expenses`)}
            size="small"
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Add New Expenses</Typography>
            <Typography variant="body2" color="text.secondary">
              Record one or more expenses for this property.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">Expense Details</Typography>
                <Button
                  startIcon={<Plus size={16} />}
                  onClick={handleAddRow}
                  size="small"
                >
                  Add Row
                </Button>
              </Box>
              <Stack spacing={3}>
                {items.map((item, index) => (
                  <Box key={item.id}>
                    {items.length > 1 && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" color="text.secondary">
                          Expense {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemove(item.id)}
                          size="small"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Box>
                    )}
                    <Grid container spacing={3} alignItems="center">
                      <Grid size={12}>
                        <Autocomplete
                          fullWidth
                          freeSolo
                          options={dictionary}
                          value={item.name}
                          onChange={(_, newValue) =>
                            handleChange(item.id, "name", newValue || "")
                          }
                          onInputChange={(_, newInputValue) =>
                            handleChange(item.id, "name", newInputValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Expense Name"
                              placeholder="e.g. Transpo, Cleaning, Supplies"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1.5,
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <NumericFormatInput
                          fullWidth
                          label="Amount"
                          value={item.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange(item.id, "amount", e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {currency.symbol}
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DatePicker
                          label="Date"
                          value={item.date}
                          onChange={(v) => handleDateChange(item.id, v)}
                          format="MMMM d, yyyy"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              sx: {
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 1.5,
                                },
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid
                        size={{
                          xs: 12,
                          sm: item.status === "PENDING" ? 6 : 12,
                        }}
                      >
                        <ToggleButtonGroup
                          fullWidth
                          value={item.status}
                          exclusive
                          onChange={(_, v) =>
                            v && handleChange(item.id, "status", v)
                          }
                          size="small"
                          sx={{
                            p: 0.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            height: 48,
                            "& .MuiToggleButton-root": {
                              border: "none",
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontWeight: 600,
                              color: "text.secondary",
                              "&.Mui-selected": {
                                bgcolor: (t) =>
                                  t.palette.mode === "light"
                                    ? "rgba(0,0,0,0.04)"
                                    : "rgba(255,255,255,0.06)",
                                color: "text.primary",
                                "&:hover": {
                                  bgcolor: (t) =>
                                    t.palette.mode === "light"
                                      ? "rgba(0,0,0,0.06)"
                                      : "rgba(255,255,255,0.08)",
                                },
                              },
                              "&:hover": {
                                bgcolor: (t) =>
                                  t.palette.mode === "light"
                                    ? "rgba(0,0,0,0.02)"
                                    : "rgba(255,255,255,0.02)",
                                color: "text.primary",
                              },
                            },
                          }}
                        >
                          <ToggleButton value="SETTLED">Settled</ToggleButton>
                          <ToggleButton value="PENDING">Pending</ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>
                      {item.status === "PENDING" && (
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Autocomplete
                            fullWidth
                            options={entities}
                            getOptionLabel={(option) => option.name}
                            value={
                              entities.find((e) => e.id === item.pendingToId) ||
                              null
                            }
                            onChange={(_, newValue) =>
                              handleChange(
                                item.id,
                                "pendingToId",
                                newValue?.id || "",
                              )
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Pending To"
                                placeholder="Select person or organization"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                  },
                                }}
                              />
                            )}
                          />
                        </Grid>
                      )}
                      <Grid size={12}>
                        <TextField
                          fullWidth
                          label="Note"
                          multiline
                          rows={2}
                          placeholder="Add any additional details..."
                          value={item.note}
                          onChange={(e) =>
                            handleChange(item.id, "note", e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
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
              {loading ? "Saving..." : "Save Expenses"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
