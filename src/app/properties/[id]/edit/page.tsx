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
import { useRouter, useParams } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { getProperty, updateProperty } from "@/lib/actions/property";
import { getPendingToEntities } from "@/lib/actions/pending-to";
import Loader from "@/components/Loader";
import { usePropertyStore } from "@/store/usePropertyStore";

type PendingTo = {
  id: string;
  name: string;
};

interface RecurringExpenseState {
  id?: string;
  name: string;
  amount: string;
  day: number;
  pendingToId: string;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { currency } = useCurrency();
  const { refresh, setIsSaving } = usePropertyStore();
  
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [initialFunds, setInitialFunds] = React.useState("");
  const [recurringExpenses, setRecurringExpenses] = React.useState<RecurringExpenseState[]>([]);
  const [entities, setEntities] = React.useState<PendingTo[]>([]);
  const [dictionaryWords, setDictionaryWords] = React.useState<string[]>([]);
  
  const [dayAnchorEl, setDayAnchorEl] = React.useState<HTMLDivElement | null>(null);
  const [selectedExpenseIndex, setSelectedExpenseIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [propertyData, entitiesData] = await Promise.all([
          getProperty(id),
          getPendingToEntities()
        ]);

        if (propertyData) {
          setName(propertyData.name);
          setLocation(propertyData.location || "");
          setInitialFunds(String(propertyData.initialFunds || 0));
          setRecurringExpenses(propertyData.recurringExpenses.map((re: { id: string, name: string, amount: number, day: number, pendingToId?: string | null }) => ({
            id: re.id,
            name: re.name,
            amount: String(re.amount),
            day: re.day,
            pendingToId: re.pendingToId || ""
          })));
        }
        setEntities(entitiesData);

        const saved = localStorage.getItem("propertyTracker_dictionary");
        if (saved) {
          setDictionaryWords(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to fetch property data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddExpense = () =>
    setRecurringExpenses([
      ...recurringExpenses,
      { name: "", amount: "", day: 1, pendingToId: "" },
    ]);

  const handleRemoveExpense = (index: number) =>
    setRecurringExpenses(recurringExpenses.filter((_, i) => i !== index));

  const handleExpenseChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const newExpenses = [...recurringExpenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setRecurringExpenses(newExpenses);
  };

  const handleDayClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
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

  const handleUpdate = async () => {
    if (!name || saving) return;
    setSaving(true);
    setIsSaving(true);
    try {
      await updateProperty(id, {
        name,
        location,
        initialFunds: parseFloat(initialFunds) || 0,
        recurringExpenses: recurringExpenses
          .filter((exp) => exp.name && exp.amount)
          .map((exp) => ({
            id: exp.id,
            name: exp.name,
            amount: parseFloat(exp.amount),
            day: exp.day,
            pendingToId: exp.pendingToId || undefined,
          })),
      });
      await refresh();
      router.push(`/properties/${id}`);
    } catch (error) {
      console.error("Failed to update property:", error);
    } finally {
      setSaving(false);
      setIsSaving(false);
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
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>Edit Property</Typography>
            <Typography variant="body2" color="text.secondary">
              Update details for {name}.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Basic Information
              </Typography>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Property Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Location (Optional)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Recurring Expenses</Typography>
                <Button
                  startIcon={<Plus size={16} />}
                  onClick={handleAddExpense}
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                >
                  Add Expense
                </Button>
              </Box>
              <Stack spacing={2}>
                {recurringExpenses.map((exp, index) => (
                  <Card 
                    variant="outlined" 
                    key={index} 
                    sx={{ p: 2, bgcolor: (t) => alpha(t.palette.primary.main, 0.02), borderRadius: 2 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={5}>
                        <Autocomplete
                          freeSolo
                          options={dictionaryWords}
                          value={exp.name}
                          onInputChange={(_, newValue) => handleExpenseChange(index, "name", newValue)}
                          onChange={(_, newValue) => handleExpenseChange(index, "name", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Expense Name"
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={2}>
                        <TextField
                          fullWidth
                          label="Day"
                          size="small"
                          value={exp.day}
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => handleDayClick(e, index)}
                          sx={{ cursor: "pointer", '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                          InputProps={{ readOnly: true, sx: { cursor: "pointer" } }}
                        />
                      </Grid>
                      <Grid size={4}>
                        <NumericFormatInput
                          fullWidth
                          size="small"
                          label="Amount"
                          value={exp.amount}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleExpenseChange(index, "amount", e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">{currency.symbol}</InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                        />
                      </Grid>
                      <Grid size={1} sx={{ textAlign: 'center' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveExpense(index)}
                          size="small"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Grid>
                      <Grid size={12}>
                        <Autocomplete
                          options={entities}
                          getOptionLabel={(option) => option.name}
                          value={entities.find((e) => e.id === exp.pendingToId) || null}
                          onChange={(_, newValue) => handleExpenseChange(index, "pendingToId", newValue?.id || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              label="Pending To (Optional)"
                              size="small"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pb: 4 }}>
            <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: 1.5, px: 3 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? null : <Save size={18} />}
              onClick={handleUpdate}
              disabled={saving || !name}
              sx={{ borderRadius: 1.5, px: 3, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Stack>
      </Box>

      <Popover
        open={Boolean(dayAnchorEl)}
        anchorEl={dayAnchorEl}
        onClose={() => setDayAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{ sx: { p: 2, width: 280, borderRadius: 2, mt: 1, boxShadow: 10 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, px: 0.5 }}>Select Day of Month</Typography>
        <Grid container spacing={1}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const isSelected = selectedExpenseIndex !== null && recurringExpenses[selectedExpenseIndex]?.day === day;
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
                    "&:hover": { bgcolor: isSelected ? "primary.dark" : (theme) => alpha(theme.palette.primary.main, 0.08) },
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
