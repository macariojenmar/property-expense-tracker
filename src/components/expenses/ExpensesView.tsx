"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  IconButton,
  alpha,
  Checkbox,
  TextField,
  Chip,
  Divider,
  InputAdornment,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  BanknoteArrowDown,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronDown,
  Ban,
  Undo2,
  TriangleAlert,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import NumericFormatInput from "@/components/NumericFormatInput";
import { usePropertyStore } from "@/store/usePropertyStore";

const mockExpenses = [
  {
    id: 1,
    name: "Cleaning Fee",
    amount: 1500,
    note: "Deep clean for Check-in",
    date: "2026-03-10",
    propertyId: 1,
  },
  {
    id: 2,
    name: "Water Bill",
    amount: 800,
    note: "February 2026",
    date: "2026-03-05",
    propertyId: 1,
  },
  {
    id: 3,
    name: "Internet Subscription",
    amount: 1800,
    note: "Fiber Plan 100Mbps",
    date: "2026-03-01",
    propertyId: 2,
  },
  {
    id: 4,
    name: "Property Tax",
    amount: 5000,
    note: "Annual payment",
    date: "2026-03-12",
    propertyId: 2,
  },
  {
    id: 5,
    name: "Repair: Faucet",
    amount: 450,
    note: "Kitchen sink leak fixed",
    date: "2026-03-15",
    propertyId: 1,
  },
  {
    id: 6,
    name: "Electricity Bill",
    amount: 3200,
    note: "Main house usage",
    date: "2026-03-18",
    propertyId: 2,
  },
];

interface ExpensesViewProps {
  propertyId: number | null;
}

function getStorageKey(
  propertyId: number | null,
  monthKey: string,
  type: "added" | "waived" | "expanded" = "added",
) {
  return `recurring_${type}_${monthKey}_${propertyId}`;
}

export default function ExpensesView({ propertyId }: ExpensesViewProps) {
  const router = useRouter();
  const { properties, setSelectedProperty, selectedProperty } =
    usePropertyStore();
  const { formatAmount, currency } = useCurrency();

  // Initialize store if we're on a property-specific page but no property is selected
  React.useEffect(() => {
    if (
      propertyId &&
      (!selectedProperty || selectedProperty.id !== propertyId)
    ) {
      const property = properties.find((p: any) => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
      }
    }
  }, [propertyId, selectedProperty, properties, setSelectedProperty]);

  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date(),
    type: "this-month",
  });

  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  // ── Expenses list state ────────────────────────────────────────────────
  const [expenses, setExpenses] = React.useState(mockExpenses);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      if (propertyId !== null && expense.propertyId !== propertyId) {
        return false;
      }
      const expenseDate = parseISO(expense.date);
      if (filterRange.start && filterRange.end) {
        return (
          expenseDate >= startOfMonth(filterRange.start) &&
          expenseDate <= endOfDay(filterRange.end)
        );
      }
      return true;
    });
  }, [filterRange, propertyId, expenses]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const totalAmount = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  // ── Recurring expenses state ────────────────────────────────────────────────
  const property = properties.find((p: any) => p.id === propertyId);
  const recurringExpenses = property?.recurringExpenses ?? [];

  // Month key e.g. "2026-03"
  const monthKey = format(new Date(), "yyyy-MM");
  const addedStorageKey = getStorageKey(propertyId, monthKey, "added");
  const waivedStorageKey = getStorageKey(propertyId, monthKey, "waived");

  // Which rows are "added" (persisted)
  const [addedSet, setAddedSet] = React.useState<Set<number>>(new Set());
  // Which rows are "waived" (persisted)
  const [waivedSet, setWaivedSet] = React.useState<Set<number>>(new Set());
  // Which rows are checked
  const [checkedSet, setCheckedSet] = React.useState<Set<number>>(new Set());
  // Controlled accordion state
  const [accordionExpanded, setAccordionExpanded] = React.useState(false);

  const expandedStorageKey = getStorageKey(propertyId, monthKey, "expanded");

  // Editable amounts per index
  const [editedAmounts, setEditedAmounts] = React.useState<
    Record<number, string>
  >({});

  // Load persisted "added", "waived", and "expanded" state on mount
  React.useEffect(() => {
    try {
      const savedAdded = localStorage.getItem(addedStorageKey);
      if (savedAdded) {
        setAddedSet(new Set(JSON.parse(savedAdded)));
      }
      const savedWaived = localStorage.getItem(waivedStorageKey);
      if (savedWaived) {
        setWaivedSet(new Set(JSON.parse(savedWaived)));
      }
      const savedExpanded = localStorage.getItem(expandedStorageKey);
      if (savedExpanded) {
        setAccordionExpanded(JSON.parse(savedExpanded));
      }
    } catch {}
  }, [addedStorageKey, waivedStorageKey, expandedStorageKey]);

  // Pre-fill editable amounts from recurring data
  React.useEffect(() => {
    const initial: Record<number, string> = {};
    recurringExpenses.forEach((exp, i) => {
      initial[i] = String(exp.amount);
    });
    setEditedAmounts(initial);
  }, [property]);

  const allChecked =
    recurringExpenses.length > 0 &&
    recurringExpenses.every((_, i) => checkedSet.has(i));
  const someChecked =
    !allChecked && recurringExpenses.some((_, i) => checkedSet.has(i));

  const handleToggleAll = () => {
    if (allChecked) {
      setCheckedSet(new Set());
    } else {
      setCheckedSet(new Set(recurringExpenses.map((_, i) => i)));
    }
  };

  const handleToggle = (i: number) => {
    const next = new Set(checkedSet);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setCheckedSet(next);
  };

  const handleAmountChange = (i: number, val: string) => {
    setEditedAmounts((prev) => ({ ...prev, [i]: val }));
  };

  const handleWaive = (i: number) => {
    const next = new Set(waivedSet);
    if (next.has(i)) {
      next.delete(i);
    } else {
      next.add(i);
      // If we waive it, uncheck it
      const nextChecked = new Set(checkedSet);
      nextChecked.delete(i);
      setCheckedSet(nextChecked);
    }
    setWaivedSet(next);
    try {
      localStorage.setItem(waivedStorageKey, JSON.stringify([...next]));
    } catch {}
  };

  const checkedAndAvailable = [...checkedSet].filter(
    (i) => !addedSet.has(i) && !waivedSet.has(i),
  );
  const checkedAndAdded = [...checkedSet].filter((i) => addedSet.has(i));
  const checkedToWaive = [...checkedSet].filter(
    (i) => !addedSet.has(i) && !waivedSet.has(i),
  );
  const checkedToUnwaive = [...checkedSet].filter((i) => waivedSet.has(i));

  const handleAddSelected = () => {
    if (checkedAndAvailable.length === 0) return;

    // Create new expense items
    const today = format(new Date(), "yyyy-MM-dd");
    const newItems = checkedAndAvailable.map((i) => {
      const recurring = recurringExpenses[i];
      return {
        id: Date.now() + i, // Unique-ish ID
        name: recurring.name,
        amount: parseFloat(editedAmounts[i] || "0"),
        note: `Recurring expense for ${format(new Date(), "MMMM yyyy")}`,
        date: today,
        propertyId: propertyId!,
        recurringRef: `${i}_${monthKey}`, // Store ref for reverting
      };
    });
    (newItems as any).forEach((item: any) => {
      (item as any).isRecurring = true;
    });

    // Update expenses list
    setExpenses((prev) => [...newItems, ...prev]);

    // Update added status
    const next = new Set(addedSet);
    checkedAndAvailable.forEach((i) => next.add(i));
    setAddedSet(next);

    try {
      localStorage.setItem(addedStorageKey, JSON.stringify([...next]));
    } catch {}

    // Deselect the just-added ones
    const nextChecked = new Set(checkedSet);
    checkedAndAvailable.forEach((i) => nextChecked.delete(i));
    setCheckedSet(nextChecked);
  };

  const handleAddOne = (i: number) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const recurring = recurringExpenses[i];
    const item = {
      id: Date.now(),
      name: recurring.name,
      amount: parseFloat(editedAmounts[i] || "0"),
      note: `Recurring expense for ${format(new Date(), "MMMM yyyy")}`,
      date: today,
      propertyId: propertyId!,
      recurringRef: `${i}_${monthKey}`,
      isRecurring: true,
    };

    setExpenses((prev) => [item, ...prev]);
    const nextAdded = new Set(addedSet);
    nextAdded.add(i);
    setAddedSet(nextAdded);
    try {
      localStorage.setItem(addedStorageKey, JSON.stringify([...nextAdded]));
    } catch {}
  };

  const handleRevert = (i: number) => {
    // Remove from addedSet
    const nextAdded = new Set(addedSet);
    nextAdded.delete(i);
    setAddedSet(nextAdded);

    // Remove from main expenses list
    const ref = `${i}_${monthKey}`;
    setExpenses((prev) => prev.filter((exp: any) => exp.recurringRef !== ref));

    // Update localStorage
    try {
      localStorage.setItem(addedStorageKey, JSON.stringify([...nextAdded]));
    } catch {}
  };

  const handleRevertSelected = () => {
    if (checkedAndAdded.length === 0) return;

    // Remove from addedSet
    const nextAdded = new Set(addedSet);
    checkedAndAdded.forEach((i) => nextAdded.delete(i));
    setAddedSet(nextAdded);

    // Remove from main expenses list
    const refs = new Set(checkedAndAdded.map((i) => `${i}_${monthKey}`));
    setExpenses((prev) =>
      prev.filter((exp: any) => !refs.has(exp.recurringRef)),
    );

    // Update localStorage
    try {
      localStorage.setItem(addedStorageKey, JSON.stringify([...nextAdded]));
    } catch {}

    // Deselect
    const nextChecked = new Set(checkedSet);
    checkedAndAdded.forEach((i) => nextChecked.delete(i));
    setCheckedSet(nextChecked);
  };

  const handleWaiveSelected = () => {
    if (checkedToWaive.length === 0) return;

    const nextWaived = new Set(waivedSet);
    checkedToWaive.forEach((i) => nextWaived.add(i));
    setWaivedSet(nextWaived);

    try {
      localStorage.setItem(waivedStorageKey, JSON.stringify([...nextWaived]));
    } catch {}

    // Deselect
    const nextChecked = new Set(checkedSet);
    checkedToWaive.forEach((i) => nextChecked.delete(i));
    setCheckedSet(nextChecked);
  };

  const handleUnwaiveSelected = () => {
    if (checkedToUnwaive.length === 0) return;

    const nextWaived = new Set(waivedSet);
    checkedToUnwaive.forEach((i) => nextWaived.delete(i));
    setWaivedSet(nextWaived);

    try {
      localStorage.setItem(waivedStorageKey, JSON.stringify([...nextWaived]));
    } catch {}

    // Deselect
    const nextChecked = new Set(checkedSet);
    checkedToUnwaive.forEach((i) => nextChecked.delete(i));
    setCheckedSet(nextChecked);
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-start" },
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push(`/properties/${propertyId}`)}
            sx={{
              mb: 1,
              color: "text.secondary",
              px: 0,
              "&:hover": { bgcolor: "transparent", color: "primary.main" },
            }}
          >
            Back to Overview
          </Button>
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
              Expenses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage your property expenditures.
            </Typography>
          </Box>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mt: { xs: 2, sm: 5 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <MonthFilter value={filterRange} onChange={setFilterRange} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() =>
                router.push(`/properties/${propertyId}/expenses/create`)
              }
              fullWidth
              sx={{ height: 44, whiteSpace: "nowrap" }}
            >
              Add Expense
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* ── Recurring Expenses Quick-Add ───────────────────────────────────── */}
      {recurringExpenses.length > 0 && (
        <Accordion
          disableGutters
          expanded={accordionExpanded}
          onChange={(_, expanded) => {
            setAccordionExpanded(expanded);
            try {
              localStorage.setItem(
                expandedStorageKey,
                JSON.stringify(expanded),
              );
            } catch {}
          }}
          sx={{
            mb: 4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "transparent",
            borderRadius: 2,
            "&:before": { display: "none" },
            boxShadow: "none",
            overflow: "hidden",
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown size={20} />}
            sx={{
              px: 2,
              "&.Mui-expanded": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <RefreshCw
                  size={16}
                  color="currentColor"
                  style={{ opacity: 0.6 }}
                />
                <Typography variant="h6" fontWeight={700}>
                  Recurring Expenses
                </Typography>
                <Chip
                  label={`${addedSet.size + waivedSet.size}/${recurringExpenses.length} processed`}
                  size="small"
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    bgcolor: (t) =>
                      addedSet.size + waivedSet.size ===
                      recurringExpenses.length
                        ? alpha(t.palette.success.main, 0.12)
                        : alpha(t.palette.primary.main, 0.08),
                    color: (t) =>
                      addedSet.size + waivedSet.size ===
                      recurringExpenses.length
                        ? t.palette.success.main
                        : t.palette.primary.main,
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mr: 1,
                  fontWeight: 500,
                  display: { xs: "none", sm: "block" },
                }}
              >
                {accordionExpanded ? "Click to collapse" : "Click to expand"}
              </Typography>
            </Stack>
          </AccordionSummary>

          <AccordionDetails sx={{ p: 0 }}>
            <Box>
              {/* Header row with Add Selected Button */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.01),
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={{ flex: 1, minWidth: 0 }}
                >
                  <Checkbox
                    size="small"
                    checked={allChecked}
                    indeterminate={someChecked}
                    onChange={handleToggleAll}
                    sx={{ mr: 1 }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                  >
                    Expense
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center">
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      width: 200,
                      mr: 2,
                    }}
                  >
                    Amount
                  </Typography>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      width: 120,
                      mr: 2,
                    }}
                  >
                    Status
                  </Typography>

                  <Box
                    sx={{
                      width: 280,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 1,
                    }}
                  >
                    {checkedAndAdded.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={handleRevertSelected}
                        sx={{
                          height: 32,
                          whiteSpace: "nowrap",
                          minWidth: 0,
                          px: 1.5,
                        }}
                      >
                        Revert ({checkedAndAdded.length})
                      </Button>
                    )}
                    {checkedToUnwaive.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={handleUnwaiveSelected}
                        sx={{
                          height: 32,
                          whiteSpace: "nowrap",
                          minWidth: 0,
                          px: 1.5,
                        }}
                      >
                        Unwaive ({checkedToUnwaive.length})
                      </Button>
                    )}
                    {checkedAndAvailable.length > 0 && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          onClick={handleWaiveSelected}
                          sx={{
                            height: 32,
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            px: 1.5,
                          }}
                        >
                          Waive ({checkedToWaive.length})
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={handleAddSelected}
                          sx={{
                            height: 32,
                            whiteSpace: "nowrap",
                            minWidth: 0,
                            px: 1.5,
                          }}
                        >
                          Add ({checkedAndAvailable.length})
                        </Button>
                      </>
                    )}
                  </Box>
                </Stack>
              </Stack>

              {/* Expense rows */}
              {recurringExpenses.map((exp, i) => {
                const isAdded = addedSet.has(i);
                const isChecked = checkedSet.has(i);

                return (
                  <Box key={i}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 1.25,
                        transition: "background 0.15s",
                        bgcolor: isChecked
                          ? (t) => alpha(t.palette.primary.main, 0.04)
                          : "transparent",
                        "&:hover": {
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      {/* Checkbox */}
                      <Checkbox
                        size="small"
                        checked={isChecked}
                        onChange={() => handleToggle(i)}
                        sx={{
                          mr: 1,
                        }}
                      />

                      {/* Name + due day */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            color: (isAdded || waivedSet.has(i)) ? "text.secondary" : "text.primary",
                          }}
                        >
                          {exp.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due on day {exp.day} of the month
                        </Typography>
                      </Box>

                      {/* Editable amount */}
                      <NumericFormatInput
                        size="small"
                        value={editedAmounts[i] ?? String(exp.amount)}
                        onChange={(e: any) =>
                          handleAmountChange(i, e.target.value)
                        }
                        disabled={isAdded || waivedSet.has(i)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {currency.symbol}
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: 200,
                          mr: 2,
                          "& .MuiInputBase-input": {
                            fontWeight: 700,
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "inherit",
                            opacity: 0.6,
                          },
                        }}
                      />

                      {/* Status badge */}
                      <Box
                        sx={{
                          width: 120,
                          display: "flex",
                          mr: 2,
                        }}
                      >
                        {isAdded ? (
                          <Chip
                            icon={<CheckCircle2 size={13} />}
                            label="Added"
                            size="small"
                            sx={{
                              bgcolor: (t) =>
                                alpha(t.palette.success.main, 0.12),
                              color: "success.main",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              "& .MuiChip-icon": { color: "success.main" },
                            }}
                          />
                        ) : waivedSet.has(i) ? (
                          <Chip
                            icon={<Ban size={13} />}
                            label="Waived"
                            size="small"
                            sx={{
                              bgcolor: (t) => alpha(t.palette.divider, 0.1),
                              color: "text.secondary",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              "& .MuiChip-icon": { color: "text.secondary" },
                            }}
                          />
                        ) : (
                          (() => {
                            const today = new Date().getDate();
                            const isMissed = exp.day < today;
                            const isClose =
                              exp.day >= today && exp.day <= today + 2;

                            if (isMissed) {
                              return (
                                <Chip
                                  icon={<TriangleAlert size={13} />}
                                  label="Missed"
                                  size="small"
                                  sx={{
                                    bgcolor: (t) =>
                                      alpha(t.palette.error.main, 0.1),
                                    color: "error.main",
                                    fontWeight: 700,
                                    fontSize: "0.72rem",
                                    "& .MuiChip-icon": { color: "error.main" },
                                  }}
                                />
                              );
                            }

                            if (isClose) {
                              return (
                                <Chip
                                  icon={<Clock size={13} />}
                                  label="Due Soon"
                                  size="small"
                                  sx={{
                                    bgcolor: (t) =>
                                      alpha(t.palette.warning.main, 0.15),
                                    color: "#b45309", // Darker amber
                                    fontWeight: 700,
                                    fontSize: "0.72rem",
                                    "& .MuiChip-icon": { color: "#b45309" },
                                  }}
                                />
                              );
                            }

                            return (
                              <Chip
                                icon={<Clock size={13} />}
                                label="Not Yet Added"
                                size="small"
                                sx={{
                                  bgcolor: (t) =>
                                    alpha(t.palette.warning.main, 0.1),
                                  color: "warning.main",
                                  fontWeight: 600,
                                  fontSize: "0.72rem",
                                  "& .MuiChip-icon": { color: "warning.main" },
                                }}
                              />
                            );
                          })()
                        )}
                      </Box>

                      {/* Action buttons (Add/Waive/Revert) */}
                      <Box
                        sx={{
                          width: 280,
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        {isAdded ? (
                          <Tooltip title="Revert">
                            <IconButton
                              size="small"
                              onClick={() => handleRevert(i)}
                              sx={{
                                color: "text.secondary",
                                "&:hover": {
                                  color: "primary.main",
                                  bgcolor: (t) =>
                                    alpha(t.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              <RefreshCw size={16} />
                            </IconButton>
                          </Tooltip>
                        ) : waivedSet.has(i) ? (
                          <Tooltip title="Unwaive">
                            <IconButton
                              size="small"
                              onClick={() => handleWaive(i)}
                              sx={{
                                color: "primary.main",
                                "&:hover": {
                                  color: "primary.main",
                                  bgcolor: (t) =>
                                    alpha(t.palette.primary.main, 0.05),
                                },
                              }}
                            >
                              <Undo2 size={18} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="Add Now">
                              <IconButton
                                size="small"
                                onClick={() => handleAddOne(i)}
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    color: "primary.main",
                                    bgcolor: (t) =>
                                      alpha(t.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <Plus size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Waive">
                              <IconButton
                                size="small"
                                onClick={() => handleWaive(i)}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "primary.main",
                                    bgcolor: (t) =>
                                      alpha(t.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <Ban size={18} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </Stack>
                    {i < recurringExpenses.length - 1 && (
                      <Divider sx={{ borderStyle: "dashed", mx: 2 }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {(totalPages > 1 || filteredExpenses.length > 0) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "error.main" }}
          >
            Total: {formatAmount(totalAmount)}
          </Typography>

          {totalPages > 1 && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {(page - 1) * itemsPerPage + 1}–
                {Math.min(page * itemsPerPage, filteredExpenses.length)} of{" "}
                {filteredExpenses.length}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  sx={{ color: "text.secondary" }}
                >
                  <ChevronLeft size={20} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  sx={{ color: "text.secondary" }}
                >
                  <ChevronRight size={20} />
                </IconButton>
              </Stack>
            </Stack>
          )}
        </Box>
      )}

      <Stack
        spacing={2}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", mb: 4 }}
      >
        {paginatedExpenses.map((expense) => (
          <Card
            key={expense.id}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s",
              cursor: "pointer",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
              },
            }}
          >
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{ flexGrow: 1 }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === "light"
                      ? alpha(theme.palette.error.main, 0.1)
                      : alpha(theme.palette.error.main, 0.2),
                  borderRadius: 2,
                  color: "error.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BanknoteArrowDown size={22} />
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {expense.name}
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={14} />
                    <Typography variant="caption">
                      {format(new Date(expense.date), "MMMM d, yyyy")}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  px: 2,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <FileText size={14} color="gray" style={{ marginTop: 4 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrientation: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {expense.note}
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ textAlign: "right", minWidth: 120 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "error.main" }}
                >
                  -{formatAmount(expense.amount)}
                </Typography>
              </Box>

              <ChevronRight size={20} color="gray" />
            </Stack>
          </Card>
        ))}

        {paginatedExpenses.length === 0 && (
          <Card
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 8,
              textAlign: "center",
              bgcolor: "transparent",
              borderStyle: "dashed",
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No expenses found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filter or add a new expense.
            </Typography>
          </Card>
        )}
      </Stack>
    </DashboardLayout>
  );
}
