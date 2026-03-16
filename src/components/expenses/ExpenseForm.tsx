"use client";

import * as React from "react";
import {
  Box,
  Typography,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Trash2 } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";

export interface ExpenseFormData {
  id: string | number;
  name: string;
  amount: string;
  date: Date;
  note: string;
  status: "PENDING" | "SETTLED" | "DELETED";
  pendingToId: string;
}

interface ExpenseFormProps {
  item: ExpenseFormData;
  index?: number;
  showIndex?: boolean;
  onRemove?: (id: string | number) => void;
  onChange: (
    id: string | number,
    field: keyof ExpenseFormData,
    value: string | Date | "PENDING" | "SETTLED" | "DELETED",
  ) => void;
  entities: { id: string; name: string }[];
  dictionary: string[];
}

export default function ExpenseForm({
  item,
  index,
  showIndex = false,
  onRemove,
  onChange,
  entities,
  dictionary,
}: ExpenseFormProps) {
  const { currency } = useCurrency();

  return (
    <Box>
      {(showIndex || onRemove) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          {showIndex && (
            <Typography variant="subtitle2" color="text.secondary">
              Expense {index !== undefined ? index + 1 : ""}
            </Typography>
          )}
          {onRemove && (
            <IconButton
              color="error"
              onClick={() => onRemove(item.id)}
              size="small"
              sx={{ ml: "auto" }}
            >
              <Trash2 size={22} />
            </IconButton>
          )}
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
              onChange(item.id, "name", newValue || "")
            }
            onInputChange={(_, newInputValue) =>
              onChange(item.id, "name", newInputValue)
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
              onChange(item.id, "amount", e.target.value)
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
            onChange={(v) => onChange(item.id, "date", v || new Date())}
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
            onChange={(_, v) => v && onChange(item.id, "status", v)}
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
              value={entities.find((e) => e.id === item.pendingToId) || null}
              onChange={(_, newValue) =>
                onChange(item.id, "pendingToId", newValue?.id || "")
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
            onChange={(e) => onChange(item.id, "note", e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1.5,
              },
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
