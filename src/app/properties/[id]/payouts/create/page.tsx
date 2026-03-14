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
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useRouter, useParams } from "next/navigation";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { usePropertyStore } from "@/store/usePropertyStore";

export default function CreatePayoutPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id;
  const { currency } = useCurrency();
  const { payouts } = usePropertyStore();

  const [items, setItems] = React.useState([
    { id: 1, label: "Property Payout", amount: "", date: new Date() },
  ]);
  const [dictionary, setDictionary] = React.useState<string[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem("propertyTracker_dictionary");
    if (saved) {
      try {
        setDictionary(JSON.parse(saved));
      } catch (e) {}
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
  }, []);

  const handleAddRow = () =>
    setItems([
      ...items,
      { id: Date.now(), label: "Property Payout", amount: "", date: new Date() },
    ]);

  const handleRemove = (id: number) =>
    setItems(items.filter((i) => i.id !== id));

  const handleChange = (id: number, field: "label" | "amount", value: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleDateChange = (id: number, value: Date | null) =>
    setItems(
      items.map((i) => (i.id === id ? { ...i, date: value || new Date() } : i)),
    );

  const handleSave = () => {
    // In a real app, we would dispatch an action to add these payouts
    // For now, since we're using a mock store that isn't persistent,
    // we'll just navigate back.
    // However, I'll update the store to support adding payouts if needed.
    router.push(`/properties/${propertyId}/payouts`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => router.push(`/properties/${propertyId}/payouts`)}
            size="small"
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4">Record Payouts</Typography>
            <Typography variant="body2" color="text.secondary">
              Record one or more payouts for this property.
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
                <Typography variant="h6">Payout Details</Typography>
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
                          Payout {index + 1}
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
                    <Grid container spacing={2}>
                      <Grid size={12}>
                        <Autocomplete
                          fullWidth
                          freeSolo
                          options={dictionary}
                          value={item.label}
                          onChange={(_, newValue) =>
                            handleChange(item.id, "label", newValue || "")
                          }
                          onInputChange={(_, newInputValue) =>
                            handleChange(item.id, "label", newInputValue)
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Payout Label"
                              placeholder="e.g. Rent, Salary"
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <NumericFormatInput
                          fullWidth
                          label="Amount"
                          value={item.amount}
                          onChange={(e: any) =>
                            handleChange(item.id, "amount", e.target.value)
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
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DatePicker
                          label="Date"
                          value={item.date}
                          onChange={(v) => handleDateChange(item.id, v)}
                          format="MMMM d, yyyy"
                          slotProps={{ textField: { fullWidth: true } }}
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
              onClick={() => router.push(`/properties/${propertyId}/payouts`)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save size={18} />}
              onClick={handleSave}
            >
              Save Payouts
            </Button>
          </Box>
        </Stack>
      </Box>
    </DashboardLayout>
  );
}
