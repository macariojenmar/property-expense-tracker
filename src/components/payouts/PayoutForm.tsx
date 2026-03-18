"use client";

import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Stack,
  IconButton,
  InputAdornment,
  Autocomplete,
  Typography,
} from "@mui/material";
import { Plus, Trash2, Save } from "lucide-react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import { getDictionaryWords } from "@/lib/actions/dictionary";

interface Word {
  id: string;
  word: string;
}

export interface PayoutItem {
  id: number | string;
  label: string;
  amount: string;
  date: Date;
}

export interface PayoutFormProps {
  initialItems: PayoutItem[];
  onSubmit: (items: PayoutItem[]) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void | Promise<void>;
  isEditing?: boolean;
  loading?: boolean;
  submitLabel?: string;
  title?: string;
}

export default function PayoutForm({
  initialItems,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
  loading = false,
  submitLabel = "Save Payouts",
  title = "Payout Details",
}: PayoutFormProps) {
  const { currency } = useCurrency();
  const [items, setItems] = React.useState<PayoutItem[]>(initialItems);
  const [dictionary, setDictionary] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const data = await getDictionaryWords();
        setDictionary(data.map((w: Word) => w.word));
      } catch (error) {
        console.error("Failed to fetch dictionary:", error);
      }
    };
    fetchDictionary();
  }, []);

  const handleAddRow = () =>
    setItems([
      ...items,
      {
        id: Date.now(),
        label: "Property Payout",
        amount: "",
        date: new Date(),
      },
    ]);

  const handleRemove = (id: number | string) =>
    setItems(items.filter((i) => i.id !== id));

  const handleChange = (
    id: number | string,
    field: "label" | "amount",
    value: string,
  ) => setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  const handleDateChange = (id: number | string, value: Date | null) =>
    setItems(
      items.map((i) => (i.id === id ? { ...i, date: value || new Date() } : i)),
    );

  const handleSubmit = async () => {
    await onSubmit(items);
  };

  return (
    <Stack spacing={4}>
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>
            {title}
          </Typography>
          <Stack spacing={3}>
            {items.map((item, index) => (
              <Box key={item.id}>
                {items.length > 1 && !isEditing && (
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
                      <Trash2 size={22} />
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
                  <Grid size={{ xs: 12, sm: isEditing ? 6 : 6 }}>
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
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: isEditing ? 6 : 6 }}>
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
            {!isEditing && (
              <Button
                sx={{ width: { xs: "100%", sm: "fit-content" } }}
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={handleAddRow}
              >
                Add Row
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent={"space-between"}
        gap={2}
      >
        {isEditing && onDelete ? (
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={18} />}
            onClick={onDelete}
            disabled={loading}
          >
            Delete Payout
          </Button>
        ) : (
          <Box /> // Spacer
        )}
        <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={loading ? null : <Save size={18} />}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
