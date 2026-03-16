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
  Popover,
  ButtonBase,
  Autocomplete,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { createProperty } from "@/lib/actions/property";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import { usePropertyStore } from "@/store/usePropertyStore";

type PendingTo = {
  id: string;
  name: string;
};

export default function CreatePropertyPage() {
  const router = useRouter();
  const { currency } = useCurrency();
  const { setIsSaving } = usePropertyStore();
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [initialFunds, setInitialFunds] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [initialExpenses, setInitialExpenses] = React.useState<
    {
      name: string;
      amount: string | number;
      day: number;
      pendingToId: string;
    }[]
  >([{ name: "", amount: "", day: 1, pendingToId: "" }]);
  const [entities, setEntities] = React.useState<PendingTo[]>([]);
  const [dayAnchorEl, setDayAnchorEl] = React.useState<HTMLDivElement | null>(
    null,
  );
  const [selectedExpenseIndex, setSelectedExpenseIndex] = React.useState<
    number | null
  >(null);
  const [dictionaryWords, setDictionaryWords] = React.useState<string[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("propertyTracker_dictionary");
    if (saved) {
      try {
        setDictionaryWords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse dictionary", e);
      }
    }

    const fetchEntities = async () => {
      try {
        const data = await getPendingToEntities();
        setEntities(data);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      }
    };
    fetchEntities();
  }, []);

  const handleAddInitialExpense = () =>
    setInitialExpenses([
      ...initialExpenses,
      { name: "", amount: "", day: 1, pendingToId: "" },
    ]);
  const handleRemoveInitialExpense = (index: number) =>
    setInitialExpenses(initialExpenses.filter((_, i) => i !== index));

  const handleExpenseChange = (
    index: number,
    field: "name" | "amount" | "day" | "pendingToId",
    value: string | number,
  ) => {
    const newExpenses = [...initialExpenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setInitialExpenses(newExpenses);
  };

  const handleDayClick = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    setDayAnchorEl(event.currentTarget);
    setSelectedExpenseIndex(index);
  };

  const handleDaySelect = (day: number) => {
    if (selectedExpenseIndex !== null) {
      handleExpenseChange(selectedExpenseIndex, "day", day);
    }
    setDayAnchorEl(null);
    setSelectedExpenseIndex(null);
  };

  const handleCreate = async () => {
    if (!name) return;
    setLoading(true);
    setIsSaving(true);
    try {
      await createProperty({
        name,
        location,
        initialFunds: parseFloat(initialFunds) || 0,
        recurringExpenses: initialExpenses
          .filter((exp) => exp.name && exp.amount)
          .map((exp) => ({
            name: exp.name,
            amount: parseFloat(exp.amount as string),
            day: exp.day,
            pendingToId: exp.pendingToId || undefined,
          })),
      });
      await usePropertyStore.getState().refresh();
      router.push("/properties");
    } catch (error) {
      console.error("Failed to create property:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Create New Property</Typography>
            <Typography variant="body2" color="text.secondary">
              Add details for your Airbnb listing.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Property Name"
                    placeholder="e.g. Cozy Beachfront Villa"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Location (Optional)"
                    placeholder="Siargao, Philippines"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Grid>
                <Grid size={12}>
                  <NumericFormatInput
                    fullWidth
                    label="Current Funds"
                    value={initialFunds}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInitialFunds(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {currency.symbol}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="h6">Recurring Expenses</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Plus size={16} />}
                  onClick={handleAddInitialExpense}
                  size="small"
                >
                  Add Expense
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monthly bills (Rent, Association Dues, Internet, etc.)
              </Typography>
              <Stack spacing={2}>
                {initialExpenses.map((exp, index) => (
                  <Card
                    variant="outlined"
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
                    }}
                  >
                    <Grid size={12} sx={{ textAlign: "right", mb: 1 }}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveInitialExpense(index)}
                        size="small"
                        disabled={initialExpenses.length === 1}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Grid>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={6}>
                        <Autocomplete
                          freeSolo
                          options={dictionaryWords}
                          value={exp.name}
                          onInputChange={(_, newValue) =>
                            handleExpenseChange(index, "name", newValue)
                          }
                          onChange={(_, newValue) =>
                            handleExpenseChange(index, "name", newValue || "")
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Expense Name"
                              placeholder="e.g. Rent"
                              size="small"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={6}>
                        <NumericFormatInput
                          fullWidth
                          size="small"
                          label="Amount"
                          value={exp.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleExpenseChange(index, "amount", e.target.value)
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {currency.symbol}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={3}>
                        <TextField
                          fullWidth
                          label="Day"
                          size="small"
                          value={exp.day}
                          onClick={(e) =>
                            handleDayClick(
                              e as React.MouseEvent<HTMLDivElement>,
                              index,
                            )
                          }
                          sx={{ cursor: "pointer" }}
                          InputProps={{
                            readOnly: true,
                            sx: { cursor: "pointer" },
                          }}
                        />
                      </Grid>

                      <Grid size={9}>
                        <Autocomplete
                          options={entities}
                          getOptionLabel={(option) => option.name}
                          value={
                            entities.find((e) => e.id === exp.pendingToId) ||
                            null
                          }
                          onChange={(_, newValue) =>
                            handleExpenseChange(
                              index,
                              "pendingToId",
                              newValue?.id || "",
                            )
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Pending To (Optional)"
                              size="small"
                              placeholder="Select person or organization"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 4 }}
          >
            <Button variant="outlined" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? null : <Save size={18} />}
              onClick={handleCreate}
              disabled={loading || !name}
            >
              {loading ? "Creating..." : "Create Property"}
            </Button>
          </Box>
        </Stack>
      </Box>

      <Popover
        open={Boolean(dayAnchorEl)}
        anchorEl={dayAnchorEl}
        onClose={() => setDayAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 280,
            borderRadius: 2,
            mt: 1,
            boxShadow: (theme) => theme.shadows[10],
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, px: 0.5 }}>
          Select Day of Month
        </Typography>
        <Grid container spacing={1}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isSelected =
              selectedExpenseIndex !== null &&
              initialExpenses[selectedExpenseIndex]?.day === day;
            return (
              <Grid size={12 / 7} key={day}>
                <ButtonBase
                  onClick={() => handleDaySelect(day)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 1,
                    fontSize: "0.875rem",
                    fontWeight: isSelected ? 600 : 400,
                    bgcolor: isSelected ? "primary.main" : "transparent",
                    color: isSelected ? "primary.contrastText" : "text.primary",
                    "&:hover": {
                      bgcolor: isSelected
                        ? "primary.dark"
                        : (theme) => alpha(theme.palette.primary.main, 0.08),
                    },
                    transition: "all 0.2s",
                  }}
                >
                  {day}
                </ButtonBase>
              </Grid>
            );
          })}
        </Grid>
      </Popover>
    </DashboardLayout>
  );
}
