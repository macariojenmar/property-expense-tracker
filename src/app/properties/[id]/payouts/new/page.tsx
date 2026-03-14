"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { useRouter, useParams } from "next/navigation";

export default function NewPayoutPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id;
  const { currency } = useCurrency();

  const [items, setItems] = React.useState([
    {
      id: 1,
      label: "Property Payout",
      amount: "",
      date: new Date(),
    },
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

  const handleAddRow = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        label: "Property Payout",
        amount: "",
        date: new Date(),
      },
    ]);
  };

  const handleRemoveRow = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSave = () => {
    // TODO: save payouts
    router.push(`/properties/${propertyId}/payouts`);
  };

  const handleCancel = () => {
    router.push(`/properties/${propertyId}/payouts`);
  };

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={handleCancel}
          sx={{
            mb: 1,
            color: "text.secondary",
            px: 0,
            "&:hover": { bgcolor: "transparent", color: "primary.main" },
          }}
        >
          Back to Payouts
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
              Record Payouts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Record one or more payouts for this property.
            </Typography>
          </Box>
          <Button
            startIcon={<Plus size={16} />}
            onClick={handleAddRow}
            size="small"
            variant="outlined"
          >
            Add Row
          </Button>
        </Box>
      </Box>

      <Stack spacing={3} sx={{ mb: 4 }}>
        {items.map((item, index) => (
          <Card
            key={item.id}
            sx={{
              p: 3,
              position: "relative",
            }}
          >
            {items.length > 1 && (
              <IconButton
                size="small"
                onClick={() => handleRemoveRow(item.id)}
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  color: "error.main",
                }}
              >
                <Trash2 size={18} />
              </IconButton>
            )}
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Payout {index + 1}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={12}>
                <Autocomplete
                  fullWidth
                  freeSolo
                  options={dictionary}
                  value={item.label}
                  onChange={(e, newValue) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id
                          ? { ...i, label: newValue || "" }
                          : i,
                      ),
                    )
                  }
                  onInputChange={(e, newInputValue) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id
                          ? { ...i, label: newInputValue }
                          : i,
                      ),
                    )
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
                  value={item.amount as string}
                  onChange={(e: any) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, amount: e.target.value } : i,
                      ),
                    )
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
                  onChange={(newValue) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id
                          ? { ...i, date: newValue || new Date() }
                          : i,
                      ),
                    )
                  }
                  format="MMMM d, yyyy"
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </Card>
        ))}
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save Payouts
        </Button>
      </Box>
    </DashboardLayout>
  );
}
