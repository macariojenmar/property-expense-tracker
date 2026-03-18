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
import { Plus, Trash2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import { getDictionaryWords } from "@/lib/actions/dictionary";
import { usePropertyStore } from "@/store/usePropertyStore";
import PageHeader from "@/components/layout/PageHeader";

interface Word {
  id: string;
  word: string;
}

type PendingTo = {
  id: string;
  name: string;
};

interface RecurringExpenseState {
  id?: string;
  name: string;
  amount: string | number;
  day: number;
  pendingToId: string;
}

interface PropertyFormProps {
  initialData?: {
    name: string;
    location: string;
    initialFunds: string | number;
    recurringExpenses: RecurringExpenseState[];
  };
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
  submitLabel: string;
  title: string;
  subtitle: string;
}

export default function PropertyForm({
  initialData,
  onSubmit,
  loading: externalLoading,
  submitLabel,
  title,
  subtitle,
}: PropertyFormProps) {
  const router = useRouter();
  const { currency } = useCurrency();
  const { setIsSaving } = usePropertyStore();

  const [name, setName] = React.useState(initialData?.name || "");
  const [location, setLocation] = React.useState(initialData?.location || "");
  const [initialFunds, setInitialFunds] = React.useState(
    String(initialData?.initialFunds || ""),
  );
  const [recurringExpenses, setRecurringExpenses] = React.useState<
    RecurringExpenseState[]
  >(
    initialData?.recurringExpenses.length
      ? initialData.recurringExpenses
      : [{ name: "", amount: "", day: 1, pendingToId: "" }],
  );

  const [entities, setEntities] = React.useState<PendingTo[]>([]);
  const [dayAnchorEl, setDayAnchorEl] = React.useState<HTMLDivElement | null>(
    null,
  );
  const [selectedExpenseIndex, setSelectedExpenseIndex] = React.useState<
    number | null
  >(null);
  const [dictionaryWords, setDictionaryWords] = React.useState<string[]>([]);
  const [internalLoading, setInternalLoading] = React.useState(false);

  const loading = externalLoading || internalLoading;

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [dictionaryData, entitiesData] = await Promise.all([
          getDictionaryWords(),
          getPendingToEntities(),
        ]);
        setDictionaryWords(dictionaryData.map((w: Word) => w.word));
        setEntities(entitiesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddExpense = () =>
    setRecurringExpenses([
      ...recurringExpenses,
      { name: "", amount: "", day: 1, pendingToId: "" },
    ]);

  const handleRemoveExpense = (index: number) =>
    setRecurringExpenses(recurringExpenses.filter((_, i) => i !== index));

  const handleExpenseChange = (
    index: number,
    field: keyof RecurringExpenseState,
    value: string | number,
  ) => {
    const newExpenses = [...recurringExpenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setRecurringExpenses(newExpenses);
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

  const handleSubmit = async () => {
    if (!name || loading) return;
    setInternalLoading(true);
    setIsSaving(true);
    try {
      await onSubmit({
        name,
        location,
        initialFunds: parseFloat(initialFunds) || 0,
        recurringExpenses: recurringExpenses
          .filter((exp) => exp.name && exp.amount)
          .map((exp) => ({
            id: exp.id,
            name: exp.name,
            amount:
              typeof exp.amount === "string"
                ? parseFloat(exp.amount)
                : exp.amount,
            day: exp.day,
            pendingToId: exp.pendingToId || undefined,
          })),
      });
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setInternalLoading(false);
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        onBack={() => router.back()}
      />

      <Stack spacing={4}>
        <Card
          sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInitialFunds(e.target.value)
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
            </Grid>
          </CardContent>
        </Card>

        <Card
          sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                mb: 1,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Recurring Expenses
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Monthly bills (Rent, Association Dues, Internet, etc.)
            </Typography>
            <Stack spacing={2}>
              {recurringExpenses.map((exp, index) => (
                <React.Fragment key={index}>
                  <Grid container spacing={2.5} alignItems="center">
                    <Grid size={12} display={"flex"} justifyContent={"end"}>
                      <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        width={"100%"}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Expense {index + 1}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveExpense(index)}
                          size="small"
                          disabled={recurringExpenses.length === 1}
                          sx={{
                            bgcolor: (t) => alpha(t.palette.error.main, 0.05),
                            "&:hover": {
                              bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                            },
                          }}
                        >
                          <Trash2 size={20} />
                        </IconButton>
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
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
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <NumericFormatInput
                        fullWidth
                        label="Amount"
                        value={exp.amount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleExpenseChange(index, "amount", e.target.value)
                        }
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                {currency.symbol}
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Day of Month"
                        value={exp.day}
                        onClick={(e) =>
                          handleDayClick(
                            e as React.MouseEvent<HTMLDivElement>,
                            index,
                          )
                        }
                        sx={{
                          cursor: "pointer",
                        }}
                        slotProps={{
                          input: {
                            readOnly: true,
                            sx: { cursor: "pointer" },
                          },
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                      <Autocomplete
                        options={entities}
                        getOptionLabel={(option) => option.name}
                        value={
                          entities.find((e) => e.id === exp.pendingToId) || null
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
                            placeholder="Select person or organization"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </React.Fragment>
              ))}
            </Stack>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={handleAddExpense}
              size="small"
              sx={{
                mt: 2,
                height: 40,
                px: 2,
                width: { xs: "100%", md: "auto" },
              }}
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          display={"flex"}
          justifyContent={"flex-end"}
        >
          <Button
            variant="outlined"
            onClick={() => router.back()}
            sx={{ px: 4, py: 1 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? null : <Save size={18} />}
            onClick={handleSubmit}
            disabled={loading || !name}
            sx={{
              px: 4,
              py: 1,
              bgcolor: "text.primary",
              color: "background.paper",
              "&:hover": {
                bgcolor: (t) => alpha(t.palette.text.primary, 0.9),
              },
            }}
          >
            {loading ? "Processing..." : submitLabel}
          </Button>
        </Stack>
      </Stack>

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
            borderRadius: 3,
            mt: 1,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, px: 0.5, fontWeight: 700 }}
        >
          Select Day of Month
        </Typography>
        <Grid container spacing={1}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isSelected =
              selectedExpenseIndex !== null &&
              recurringExpenses[selectedExpenseIndex]?.day === day;
            return (
              <Grid size={12 / 7} key={day}>
                <ButtonBase
                  onClick={() => handleDaySelect(day)}
                  sx={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: 1.5,
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
    </Box>
  );
}
