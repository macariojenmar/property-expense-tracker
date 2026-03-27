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
  addMonths,
  startOfYear,
  isWithinInterval,
  isSameDay,
  isBefore,
  isAfter,
} from "date-fns";
import { BOX_SHADOW } from "@/theme";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { styled } from "@mui/material/styles";

export interface DateRange {
  start: Date | null;
  end: Date | null;
  type: "this-month" | "last-month" | "next-month" | "this-year" | "custom";
}

interface MonthFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const StyledPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== "isRangeStart" &&
    prop !== "isRangeEnd" &&
    prop !== "isWithinRange",
})<{
  isRangeStart?: boolean;
  isRangeEnd?: boolean;
  isWithinRange?: boolean;
}>(({ theme, isRangeStart, isRangeEnd, isWithinRange }) => ({
  margin: 0,
  width: 40,
  height: 40,
  ...((isWithinRange || isRangeStart || isRangeEnd) && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "&:hover, &:focus": {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  ...(isWithinRange && {
    borderRadius: 0,
  }),
  ...(isRangeStart && {
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
  }),
  ...(isRangeEnd && {
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
  }),
}));

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
    } else if (type === "next-month") {
      const nextMonth = addMonths(now, 1);
      start = startOfMonth(nextMonth);
      end = endOfMonth(nextMonth);
    } else if (type === "this-year") {
      start = startOfYear(now);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999); // End of year
    }

    onChange({ start, end, type });
  };

  const renderLabel = () => {
    if (value.type === "this-month") return "This Month";
    if (value.type === "last-month") return "Last Month";
    if (value.type === "next-month") return "Next Month";
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
        onChange={(type) =>
          handleSelectChange({ target: { value: type } } as any)
        }
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
          { value: "next-month", label: "Next Month" },
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
              "&.Mui-selected": { bgcolor: "secondary.main" },
              "&:hover": { bgcolor: "secondary.main" },
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
            "&.Mui-selected": { bgcolor: "secondary.dark" },
            "&:hover": { bgcolor: "secondary.main" },
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
        slotProps={{
          paper: {
            sx: {
              p: 3,
              mt: 1.5,
              width: 320,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: BOX_SHADOW,
              bgcolor: "background.paper",
              backgroundImage: "none",
              color: "text.primary",
            },
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          Select Custom Range
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ minHeight: 340 }}>
            <DateCalendar
              value={tempRange.start}
              onChange={(newDate) => {
                if (!newDate) return;

                setTempRange((prev) => {
                  // If no start or already have both, start fresh
                  if (!prev.start || (prev.start && prev.end)) {
                    return { start: newDate, end: null };
                  }

                  // If we have a start but no end
                  if (prev.start && !prev.end) {
                    if (isBefore(newDate, prev.start)) {
                      return { start: newDate, end: prev.start };
                    }
                    return { ...prev, end: newDate };
                  }

                  return prev;
                });
              }}
              slots={{
                day: (props: PickersDayProps) => {
                  const { day, ...other } = props;
                  const isRangeStart =
                    tempRange.start && isSameDay(day, tempRange.start);
                  const isRangeEnd =
                    tempRange.end && isSameDay(day, tempRange.end);
                  const isWithinRange =
                    tempRange.start &&
                    tempRange.end &&
                    isWithinInterval(day, {
                      start: tempRange.start,
                      end: tempRange.end,
                    });

                  return (
                    <StyledPickersDay
                      {...other}
                      day={day}
                      isRangeStart={!!isRangeStart}
                      isRangeEnd={!!isRangeEnd}
                      isWithinRange={!!isWithinRange}
                    />
                  );
                },
              }}
              sx={{
                width: 280,
                mx: "auto",
                height: "auto",
                "& .MuiPickersCalendarHeader-root": {
                  px: 1,
                },
                "& .MuiDayCalendar-header": {
                  justifyContent: "center",
                },
                "& .MuiDayCalendar-weekContainer": {
                  justifyContent: "center",
                },
              }}
            />
          </Box>
          {tempRange.start && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              {tempRange.end
                ? `Selected: ${format(tempRange.start, "MMM d")} - ${format(tempRange.end, "MMM d, yyyy")}`
                : `Selecting end date (Start: ${format(tempRange.start, "MMM d")})`}
            </Typography>
          )}
          <Stack
            direction="row"
            spacing={1.5}
            justifyContent="flex-end"
            sx={{ mt: 1 }}
          >
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setIsPickerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onChange({
                  start: tempRange.start,
                  end: tempRange.end,
                  type: "custom",
                });
                setIsPickerOpen(false);
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
