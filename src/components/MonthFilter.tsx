"use client";

import * as React from "react";
import {
  Box,
  MenuItem,
  ListSubheader,
  Divider,
  Typography,
  Stack,
  Popover,
  Button,
  SelectChangeEvent,
} from "@mui/material";
import StandardSelect from "./StandardSelect";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
} from "date-fns";

export interface DateRange {
  start: Date | null;
  end: Date | null;
  type: "this-month" | "last-month" | "this-year" | "custom";
}

interface MonthFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function MonthFilter({ value, onChange }: MonthFilterProps) {
  const [isPickerOpen, setIsPickerOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [tempRange, setTempRange] = React.useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: value.start, end: value.end });
  const [anchorEl, setAnchorEl] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setAnchorEl(anchorRef.current);
  }, []);

  const now = new Date();

  const handleSelectChange = (e: SelectChangeEvent) => {
    const type = e.target.value as DateRange["type"];
    if (type === "custom") {
      setIsPickerOpen(true);
      return;
    }

    // Ensure picker is closed when switching to a predefined range
    setIsPickerOpen(false);

    let start: Date | null = null;
    let end: Date | null = null;

    if (type === "this-month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (type === "last-month") {
      const lastMonth = subMonths(now, 1);
      start = startOfMonth(lastMonth);
      end = endOfMonth(lastMonth);
    } else if (type === "this-year") {
      start = startOfYear(now);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // End of year
    }

    onChange({ start, end, type });
  };

  const renderLabel = () => {
    if (value.type === "this-month") return "This Month";
    if (value.type === "last-month") return "Last Month";
    if (value.type === "this-year") return "This Year";
    if (value.type === "custom" && value.start && value.end) {
      try {
        return `${format(value.start, "MMM d")} - ${format(value.end, "MMM d, yyyy")}`;
      } catch (_error) {
        return "Custom Range";
      }
    }
    return "Select Range";
  };

  return (
    <Box ref={anchorRef} sx={{ position: "relative" }}>
      <StandardSelect
        value={value.type}
        onChange={(type) => handleSelectChange({ target: { value: type } } as any)}
        onOpen={() => setIsPickerOpen(false)}
        renderValue={() => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {renderLabel()}
          </Typography>
        )}
        minWidth={{ xs: "100%", sm: 220 }}
        fullWidth
      >
        <ListSubheader
          sx={{
            lineHeight: "32px",
            bgcolor: "transparent",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
            px: 1.5,
          }}
        >
          Quick Select
        </ListSubheader>
        {[
          { value: "this-month", label: "This Month" },
          { value: "last-month", label: "Last Month" },
          { value: "this-year", label: "This Year" },
        ].map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            sx={{
              borderRadius: "6px",
              mx: 0.5,
              mb: 0.5,
              fontSize: "14px",
              color: "text.primary",
              "&.Mui-selected": { bgcolor: "action.selected" },
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            {option.label}
          </MenuItem>
        ))}

        <Divider sx={{ my: 1, mx: -1 }} />

        <ListSubheader
          sx={{
            lineHeight: "32px",
            bgcolor: "transparent",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "text.secondary",
            px: 1.5,
          }}
        >
          Custom
        </ListSubheader>
        <MenuItem
          value="custom"
          onClick={() => setIsPickerOpen(true)}
          sx={{
            borderRadius: "6px",
            mx: 0.5,
            fontSize: "14px",
            color: "text.primary",
            "&.Mui-selected": { bgcolor: "action.selected" },
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          Custom Range
        </MenuItem>
      </StandardSelect>

      <Popover
        open={isPickerOpen}
        anchorEl={anchorEl}
        onClose={() => setIsPickerOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            p: 3,
            mt: 1.5,
            width: 320,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) => theme.palette.mode === 'dark' 
              ? "0 20px 25px -5px rgb(0 0 0 / 0.5)"
              : "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            bgcolor: "background.paper",
            backgroundImage: "none",
            color: "text.primary",
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2.5, fontWeight: 700, letterSpacing: "-0.01em" }}>
          Select Custom Range
        </Typography>
        <Stack spacing={2.5}>
          <DatePicker
            label="Start Date"
            value={tempRange.start}
            onChange={(date) => setTempRange((prev) => ({ ...prev, start: date }))}
            format="MMMM d, yyyy"
            slotProps={{ 
              textField: { 
                size: "small", 
                fullWidth: true,
                sx: {
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "divider" },
                  },
                }
              } 
            }}
          />
          <DatePicker
            label="End Date"
            value={tempRange.end}
            onChange={(date) => setTempRange((prev) => ({ ...prev, end: date }))}
            format="MMMM d, yyyy"
            slotProps={{ 
              textField: { 
                size: "small", 
                fullWidth: true,
                sx: {
                  "& .MuiInputLabel-root": { color: "text.secondary" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "divider" },
                  },
                }
              } 
            }}
          />
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button
              size="small"
              onClick={() => setIsPickerOpen(false)}
              sx={{ 
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: "action.hover" }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                onChange({
                  start: tempRange.start,
                  end: tempRange.end,
                  type: "custom",
                });
                setIsPickerOpen(false);
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" }
              }}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Popover>
    </Box>
  );
}
