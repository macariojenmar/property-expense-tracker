"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
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
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Grid,
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
  ChevronDown,
  Ban,
  Undo2,
  TriangleAlert,
  Search,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import PageHeader from "@/components/layout/PageHeader";
import NumericFormatInput from "@/components/NumericFormatInput";
import {
  usePropertyStore,
  Property,
  Expense,
  RecurringExpense,
  WaivedRecurringExpense,
} from "@/store/usePropertyStore";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import PricingDialog from "@/components/PricingDialog";

// Local interfaces removed in favor of store interfaces

// Local interfaces removed in favor of store interfaces

interface ExpensesViewProps {
  propertyId: string | null;
}

// Local interfaces removed in favor of store interfaces

import { createExpense, settleExpenses } from "@/lib/actions/expense";
import {
  waiveRecurringExpense,
  unwaiveRecurringExpense,
} from "@/lib/actions/recurring-expense";
import { getPendingToEntities } from "@/lib/actions/pending-to";
// import { CheckCircle } from "lucide-react";

export default function ExpensesView({ propertyId }: ExpensesViewProps) {
  const router = useRouter();
  const {
    properties,
    setSelectedProperty,
    selectedProperty,
    refresh,
    setIsSaving,
    isFetchingDetails,
    fetchPropertyDetails,
  } = usePropertyStore();
  const { formatAmount, currency } = useCurrency();
  const [loading, setLoading] = React.useState(false);
  const [expenses, setExpenses] = React.useState<Expense[]>([]);
  const [pricingDialogOpen, setPricingDialogOpen] = React.useState(false);

  // Initialize store if we're on a property-specific page but no property is selected
  React.useEffect(() => {
    if (propertyId && properties.length > 0) {
      const found = properties.find((p) => p.id === propertyId);
      if (found) {
        setSelectedProperty(found);
        setExpenses(found.expenses || []);
      }
    }
  }, [propertyId, properties, setSelectedProperty]);

  React.useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails(propertyId);
    }
  }, [propertyId, fetchPropertyDetails]);

  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });
  const [searchQuery, setSearchQuery] = React.useState("");

  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [pendingToFilter, setPendingToFilter] = React.useState<string | null>(
    null,
  );
  const [entities, setEntities] = React.useState<
    { id: string; name: string }[]
  >([]);

  const handleSettleIndividual = async (id: string) => {
    if (!propertyId) return;
    try {
      setIsSaving(true);
      await settleExpenses([id], propertyId as string);
      await fetchPropertyDetails(propertyId, { force: true });
    } catch (error) {
      console.error("Failed to settle expense:", error);
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    const fetchEntities = async () => {
      try {
        const data = await getPendingToEntities();
        setEntities(data);
      } catch (e) {
        console.error("Failed to fetch entities:", e);
      }
    };
    fetchEntities();
  }, []);

  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((expense) => {
      if (
        propertyId !== null &&
        String(expense.propertyId) !== String(propertyId)
      ) {
        return false;
      }
      const expenseDate = new Date(expense.date);
      if (filterRange.start && filterRange.end) {
        if (
          expenseDate < startOfMonth(new Date(filterRange.start)) ||
          expenseDate > endOfDay(new Date(filterRange.end))
        ) {
          return false;
        }
      }

      if (
        statusFilter !== "all" &&
        (expense.status || "SETTLED") !== statusFilter
      ) {
        return false;
      }

      if (
        statusFilter === "PENDING" &&
        pendingToFilter &&
        expense.pendingToId !== pendingToFilter
      ) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const expenseName = (expense.name || "").toLowerCase();
        const expenseNote = (expense.note || "").toLowerCase();
        const expenseAmount = expense.amount.toString();
        if (
          !expenseName.includes(query) &&
          !expenseNote.includes(query) &&
          !expenseAmount.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    filterRange,
    propertyId,
    expenses,
    statusFilter,
    pendingToFilter,
    searchQuery,
  ]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const totalAmount = React.useMemo(() => {
    return filteredExpenses.reduce(
      (sum: number, expense: Expense) => sum + expense.amount,
      0,
    );
  }, [filteredExpenses]);

  // ── Recurring expenses state ────────────────────────────────────────────────
  // Prioritize selectedProperty if it matches propertyId, then search in properties list
  const property = React.useMemo(() => {
    return selectedProperty?.id === propertyId
      ? selectedProperty
      : properties.find((p) => p.id === propertyId);
  }, [selectedProperty, properties, propertyId]);

  const recurringExpenses = React.useMemo(() => {
    return (property?.recurringExpenses ?? []) as RecurringExpense[];
  }, [property]);

  const waivedRecurringExpenses = React.useMemo(() => {
    return (property?.waivedRecurringExpenses ??
      []) as WaivedRecurringExpense[];
  }, [property]);

  // Month key e.g. "2026-03"
  const monthKey = format(new Date(), "yyyy-MM");
  const expandedStorageKey = `recurring_expanded_${monthKey}_${propertyId}`;

  // Which rows are "added" (derived from real expenses)
  const addedSet = React.useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.recurringRef && exp.recurringRef.endsWith(monthKey)) {
        const id = exp.recurringRef.split("_")[0];
        set.add(id);
      }
    });
    return set;
  }, [expenses, monthKey]);

  // Which rows are "waived" (persisted in DB)
  const waivedSet = React.useMemo(() => {
    const set = new Set<string>();
    waivedRecurringExpenses.forEach((w) => {
      if (w.monthKey === monthKey) {
        set.add(w.recurringExpenseId);
      }
    });
    return set;
  }, [waivedRecurringExpenses, monthKey]);

  // Which rows are checked (local UI state)
  const [checkedSet, setCheckedSet] = React.useState<Set<string>>(new Set());
  // Controlled accordion state
  const [accordionExpanded, setAccordionExpanded] = React.useState(false);

  // Editable amounts per recurring ID
  const [editedAmounts, setEditedAmounts] = React.useState<
    Record<string, string>
  >({});

  // Pre-fill editable amounts from recurring data
  React.useEffect(() => {
    const initial: Record<string, string> = {};
    recurringExpenses.forEach((exp) => {
      initial[exp.id] = String(exp.amount);
    });
    setEditedAmounts(initial);
  }, [recurringExpenses]);

  const allChecked =
    recurringExpenses.length > 0 &&
    recurringExpenses.every((exp) => checkedSet.has(exp.id));
  const someChecked =
    !allChecked && recurringExpenses.some((exp) => checkedSet.has(exp.id));

  const handleToggleAll = () => {
    if (allChecked) {
      setCheckedSet(new Set());
    } else {
      setCheckedSet(new Set(recurringExpenses.map((exp) => exp.id)));
    }
  };

  const handleToggle = (id: string) => {
    const next = new Set(checkedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedSet(next);
  };

  const handleAmountChange = (id: string, val: string) => {
    setEditedAmounts((prev) => ({ ...prev, [id]: val }));
  };

  const handleWaive = async (recurringExpId: string) => {
    if (!propertyId) return;

    setIsSaving(true);
    try {
      if (waivedSet.has(recurringExpId)) {
        await unwaiveRecurringExpense({
          recurringExpenseId: recurringExpId,
          monthKey,
          propertyId,
        });
      } else {
        await waiveRecurringExpense({
          recurringExpenseId: recurringExpId,
          monthKey,
          propertyId,
        });
        const nextChecked = new Set(checkedSet);
        nextChecked.delete(recurringExpId);
        setCheckedSet(nextChecked);
      }
      await fetchPropertyDetails(propertyId, { force: true });
    } catch (error) {
      console.error("Failed to waive/unwaive:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkedAndAvailable = recurringExpenses
    .filter(
      (exp) =>
        checkedSet.has(exp.id) &&
        !addedSet.has(exp.id) &&
        !waivedSet.has(exp.id),
    )
    .map((exp) => exp.id);
  const checkedAndAdded = recurringExpenses
    .filter((exp) => checkedSet.has(exp.id) && addedSet.has(exp.id))
    .map((exp) => exp.id);
  const checkedToWaive = recurringExpenses
    .filter(
      (exp) =>
        checkedSet.has(exp.id) &&
        !addedSet.has(exp.id) &&
        !waivedSet.has(exp.id),
    )
    .map((exp) => exp.id);
  const checkedToUnwaive = recurringExpenses
    .filter((exp) => checkedSet.has(exp.id) && waivedSet.has(exp.id))
    .map((exp) => exp.id);

  const handleAddSelected = async () => {
    if (checkedAndAvailable.length === 0 || propertyId === null) return;

    setLoading(true);
    setIsSaving(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      for (const id of checkedAndAvailable) {
        const recurring = recurringExpenses.find((exp) => exp.id === id);
        if (!recurring) continue;

        await createExpense({
          name: recurring.name,
          amount: parseFloat(editedAmounts[id] || "0"),
          note: `Recurring expense for ${format(new Date(), "MMMM yyyy")}`,
          date: today,
          propertyId: propertyId as string,
          recurringRef: `${id}_${monthKey}`,
          isRecurring: true,
          status: recurring.pendingToId ? "PENDING" : "SETTLED",
          pendingToId: recurring.pendingToId || undefined,
        });
      }

      await fetchPropertyDetails(propertyId, { force: true });

      // Deselect the just-added ones
      const nextChecked = new Set(checkedSet);
      checkedAndAvailable.forEach((id) => nextChecked.delete(id));
      setCheckedSet(nextChecked);
    } catch (error: any) {
      if (error?.message === "LIMIT_REACHED") {
        setPricingDialogOpen(true);
      } else {
        console.error("Failed to add selected recurring:", error);
      }
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleAddOne = async (id: string) => {
    if (!propertyId) return;
    const today = format(new Date(), "yyyy-MM-dd");
    const recurring = recurringExpenses.find((exp) => exp.id === id);
    if (!recurring) return;

    try {
      setIsSaving(true);
      await createExpense({
        name: recurring.name,
        amount: parseFloat(editedAmounts[id] || "0"),
        note: `Recurring expense for ${format(new Date(), "MMMM yyyy")}`,
        date: today,
        propertyId: propertyId as string,
        recurringRef: `${id}_${monthKey}`,
        isRecurring: true,
        status: recurring.pendingToId ? "PENDING" : "SETTLED",
        pendingToId: recurring.pendingToId || undefined,
      });

      await fetchPropertyDetails(propertyId, { force: true });
    } catch (error: any) {
      if (error?.message === "LIMIT_REACHED") {
        setPricingDialogOpen(true);
      } else {
        console.error("Failed to add recurring expense:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = async (id: string) => {
    if (!propertyId) return;
    const ref = `${id}_${monthKey}`;
    const expenseToDelele = expenses.find((exp) => exp.recurringRef === ref);

    if (expenseToDelele) {
      try {
        setIsSaving(true);
        const { deleteExpense } = await import("@/lib/actions/expense");
        await deleteExpense(expenseToDelele.id);

        await fetchPropertyDetails(propertyId, { force: true });
      } catch (error) {
        console.error("Failed to revert expense:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleRevertSelected = async () => {
    if (checkedAndAdded.length === 0 || !propertyId) return;

    setLoading(true);
    setIsSaving(true);
    try {
      const { deleteExpense } = await import("@/lib/actions/expense");
      for (const id of checkedAndAdded) {
        const ref = `${id}_${monthKey}`;
        const exp = expenses.find((e) => e.recurringRef === ref);
        if (exp) {
          await deleteExpense(exp.id);
        }
      }

      await fetchPropertyDetails(propertyId, { force: true });

      // Deselect
      const nextChecked = new Set(checkedSet);
      checkedAndAdded.forEach((id) => nextChecked.delete(id));
      setCheckedSet(nextChecked);
    } catch (error) {
      console.error("Failed to revert selected:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleWaiveSelected = async () => {
    if (checkedToWaive.length === 0 || !propertyId) return;

    setLoading(true);
    setIsSaving(true);
    try {
      for (const id of checkedToWaive) {
        await waiveRecurringExpense({
          recurringExpenseId: id,
          monthKey,
          propertyId,
        });
      }

      await fetchPropertyDetails(propertyId, { force: true });

      // Deselect
      const nextChecked = new Set(checkedSet);
      checkedToWaive.forEach((id) => nextChecked.delete(id));
      setCheckedSet(nextChecked);
    } catch (error) {
      console.error("Failed to waive selected:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  const handleUnwaiveSelected = async () => {
    if (checkedToUnwaive.length === 0 || !propertyId) return;

    setLoading(true);
    setIsSaving(true);
    try {
      for (const id of checkedToUnwaive) {
        await unwaiveRecurringExpense({
          recurringExpenseId: id,
          monthKey,
          propertyId,
        });
      }

      await fetchPropertyDetails(propertyId, { force: true });

      // Deselect
      const nextChecked = new Set(checkedSet);
      checkedToUnwaive.forEach((id) => nextChecked.delete(id));
      setCheckedSet(nextChecked);
    } catch (error) {
      console.error("Failed to unwaive selected:", error);
    } finally {
      setLoading(false);
      setIsSaving(false);
    }
  };

  if (loading || isFetchingDetails) {
    return (
      <DashboardLayout>
        <Loader message="Loading expenses..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageHeader
        onBack={() => router.push(`/properties/${propertyId}`)}
        title="Expenses"
        subtitle="Track and manage your property expenditures."
        actions={
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={2}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() =>
                router.push(
                  `/properties/${propertyId as string}/expenses/create`,
                )
              }
            >
              Add Expense
            </Button>
          </Stack>
        }
      />

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
              px: { xs: 1.5, sm: 2 },
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
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                >
                  Recurring
                </Typography>
                <Chip
                  label={`${addedSet.size + waivedSet.size}/${recurringExpenses.length}`}
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
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "stretch", sm: "center" }}
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.25,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.01),
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  gap: { xs: 1.5, sm: 0 },
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
                      display: { xs: "none", sm: "block" },
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
                      width: 130,
                      mr: 2,
                      display: { xs: "none", sm: "block" },
                    }}
                  >
                    Status
                  </Typography>

                  <Box
                    sx={{
                      width: { xs: "100%", sm: 500 },
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1,
                    }}
                  >
                    {checkedAndAdded.length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={handleRevertSelected}
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
                        >
                          Waive ({checkedAndAvailable.length})
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          color="primary"
                          onClick={handleAddSelected}
                        >
                          Add ({checkedAndAvailable.length})
                        </Button>
                      </>
                    )}
                  </Box>
                </Stack>
              </Stack>

              {/* Expense rows */}
              {recurringExpenses.map((exp: RecurringExpense) => {
                const isAdded = addedSet.has(exp.id);
                const isChecked = checkedSet.has(exp.id);
                const isWaived = waivedSet.has(exp.id);

                return (
                  <Box key={exp.id}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      sx={{
                        px: 2,
                        py: { xs: 2.5, sm: 1.25 },
                        transition: "background 0.15s",
                        bgcolor: isChecked
                          ? (t) => alpha(t.palette.primary.main, 0.04)
                          : "transparent",
                        "&:hover": {
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                        },
                      }}
                    >
                      {/* Top Row: Checkbox, Info, and mobile Actions */}
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        sx={{ mb: { xs: 2, sm: 0 }, flex: 1 }}
                      >
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggle(exp.id)}
                          sx={{
                            mr: 1,
                            mt: -0.5,
                          }}
                        />

                        {/* Name + due day */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{
                              fontSize: { xs: "0.9rem", sm: "0.875rem" },
                              color:
                                isAdded || isWaived
                                  ? "text.secondary"
                                  : "text.primary",
                            }}
                          >
                            {exp.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due on day {exp.day}
                            {exp.pendingTo && (
                              <Box
                                component="span"
                                sx={{
                                  ml: 1,
                                  fontStyle: "italic",
                                  opacity: 0.8,
                                }}
                              >
                                • Pending to {exp.pendingTo.name}
                              </Box>
                            )}
                          </Typography>
                        </Box>

                        {/* Mobile-only Action buttons */}
                        <Box
                          sx={{ display: { xs: "flex", sm: "none" }, gap: 1 }}
                        >
                          {isAdded ? (
                            <IconButton
                              size="small"
                              onClick={() => handleRevert(exp.id)}
                              sx={{ color: "text.secondary" }}
                            >
                              <RefreshCw size={22} />
                            </IconButton>
                          ) : isWaived ? (
                            <IconButton
                              size="small"
                              onClick={() => handleWaive(exp.id)}
                              sx={{ color: "primary.main" }}
                            >
                              <Undo2 size={22} />
                            </IconButton>
                          ) : (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleAddOne(exp.id)}
                                sx={{ color: "primary.main" }}
                              >
                                <Plus size={22} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleWaive(exp.id)}
                                sx={{ color: "text.secondary" }}
                              >
                                <Ban size={22} />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Stack>

                      {/* Bottom Group (Desktop Row Parts) */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ pl: { xs: 5, sm: 0 } }}
                      >
                        {/* Editable amount */}
                        <NumericFormatInput
                          size="small"
                          value={editedAmounts[exp.id] ?? String(exp.amount)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleAmountChange(exp.id, e.target.value)
                          }
                          disabled={isAdded || isWaived}
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
                            width: { xs: 120, sm: 180 },
                            mr: { xs: 0, sm: 2 },
                            "& .MuiInputBase-input": {
                              fontWeight: 700,
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
                            width: { xs: "auto", sm: 370 },
                            display: "flex",
                            mr: { xs: 0, sm: 2 },
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
                          ) : isWaived ? (
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
                                      "& .MuiChip-icon": {
                                        color: "error.main",
                                      },
                                    }}
                                  />
                                );
                              }

                              if (isClose) {
                                return (
                                  <Chip
                                    icon={<Clock size={13} />}
                                    label="Soon"
                                    size="small"
                                    sx={{
                                      bgcolor: (t) =>
                                        alpha(t.palette.warning.main, 0.15),
                                      color: "#b45309",
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
                                  label="Not Added"
                                  size="small"
                                  sx={{
                                    bgcolor: (t) =>
                                      alpha(t.palette.warning.main, 0.1),
                                    color: "warning.main",
                                    fontWeight: 600,
                                    fontSize: "0.72rem",
                                    "& .MuiChip-icon": {
                                      color: "warning.main",
                                    },
                                  }}
                                />
                              );
                            })()
                          )}
                        </Box>

                        {/* Desktop-only Action buttons (Add/Waive/Revert) */}
                        <Box
                          sx={{
                            width: 280,
                            display: { xs: "none", sm: "flex" },
                            justifyContent: "flex-end",
                            gap: 0.5,
                          }}
                        >
                          {isAdded ? (
                            <Tooltip title="Revert">
                              <IconButton
                                size="small"
                                onClick={() => handleRevert(exp.id)}
                                sx={{
                                  color: "text.secondary",
                                  "&:hover": {
                                    color: "primary.main",
                                    bgcolor: (t) =>
                                      alpha(t.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <RefreshCw size={22} />
                              </IconButton>
                            </Tooltip>
                          ) : isWaived ? (
                            <Tooltip title="Unwaive">
                              <IconButton
                                size="small"
                                onClick={() => handleWaive(exp.id)}
                                sx={{
                                  color: "primary.main",
                                  "&:hover": {
                                    color: "primary.main",
                                    bgcolor: (t) =>
                                      alpha(t.palette.primary.main, 0.05),
                                  },
                                }}
                              >
                                <Undo2 size={22} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Add Now">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAddOne(exp.id)}
                                  sx={{
                                    color: "primary.main",
                                    "&:hover": {
                                      color: "primary.main",
                                      bgcolor: (t) =>
                                        alpha(t.palette.primary.main, 0.05),
                                    },
                                  }}
                                >
                                  <Plus size={22} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Waive">
                                <IconButton
                                  size="small"
                                  onClick={() => handleWaive(exp.id)}
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
                    </Stack>
                    {exp !==
                      recurringExpenses[recurringExpenses.length - 1] && (
                      <Divider sx={{ borderStyle: "dashed", mx: 2 }} />
                    )}
                  </Box>
                );
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, v) => v && setStatusFilter(v)}
            size="small"
            sx={{
              p: 0.5,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              width: { xs: "100%", sm: "auto" },
              "& .MuiToggleButton-root": {
                flex: { xs: 1, sm: "initial" },
                border: "none",
                borderRadius: 1.5,
                px: 3,
                py: 1,
                mx: 0.25,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
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
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="SETTLED">Settled</ToggleButton>
            <ToggleButton value="PENDING">Pending</ToggleButton>
          </ToggleButtonGroup>

          {statusFilter === "PENDING" && (
            <Autocomplete
              size="small"
              options={entities}
              getOptionLabel={(option) => option.name}
              value={entities.find((e) => e.id === pendingToFilter) || null}
              onChange={(_, newValue) =>
                setPendingToFilter(newValue?.id || null)
              }
              sx={{ width: { xs: "100%", sm: 300 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filter by Entity"
                  placeholder="Select name..."
                />
              )}
            />
          )}
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search expenses"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", sm: 250 } }}
          />
          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <MonthFilter value={filterRange} onChange={setFilterRange} />
          </Box>
        </Stack>
      </Box>

      {(totalPages > 1 || filteredExpenses.length > 0) && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "error.main",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Total: {formatAmount(totalAmount)}
          </Typography>

          {totalPages > 1 && (
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
            >
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
            onClick={() =>
              router.push(
                `/properties/${propertyId}/expenses/${expense.id}/edit`,
              )
            }
            sx={{
              p: { xs: 1.5, sm: 2 },
              transition: "all 0.2s",
              cursor: "pointer",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
              },
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Column 1: Content (Icon + Name + Date + Status) */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack
                  direction="row"
                  spacing={{ xs: 2, sm: 3 }}
                  alignItems="center"
                  sx={{ flexGrow: 1, minWidth: 0 }}
                >
                  <Box
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      bgcolor: (theme) =>
                        theme.palette.mode === "light"
                          ? alpha(theme.palette.error.main, 0.1)
                          : alpha(theme.palette.error.main, 0.2),
                      borderRadius: 2,
                      color: "error.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <BanknoteArrowDown size={22} />
                  </Box>

                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        lineHeight: 1.2,
                        mb: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {expense.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      color="text.secondary"
                    >
                      <Calendar size={14} />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                      >
                        {format(new Date(expense.date), "MMM d, yyyy")}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mt: 0.5 }}
                    >
                      <Chip
                        label={
                          expense.status === "PENDING" ? "Pending" : "Settled"
                        }
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: (t) =>
                            expense.status === "PENDING"
                              ? alpha(t.palette.warning.main, 0.1)
                              : alpha(t.palette.success.main, 0.1),
                          color: (t) =>
                            expense.status === "PENDING"
                              ? "warning.main"
                              : "success.main",
                        }}
                      />
                      {expense.status === "PENDING" && expense.pendingTo && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.65rem" }}
                        >
                          To: {expense.pendingTo.name}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Column 2: Note */}
              <Grid
                size={{ xs: 12, md: 4 }}
                display={{
                  xs:
                    expense.note && expense.note.trim() !== ""
                      ? "block"
                      : "none",
                  md: "block",
                }}
              >
                {expense.note && expense.note.trim() !== "" && (
                  <Box sx={{ px: { xs: 5.5, sm: 0 } }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileText size={14} color="gray" />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {expense.note}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Grid>

              {/* Column 3: Amount + Actions */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{
                    justifyContent: { xs: "space-between", sm: "flex-end" },
                    pl: { xs: 5.5, sm: 0 },
                  }}
                >
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "error.main",
                        fontSize: {
                          xs: "0.95rem",
                          sm: "1.1rem",
                          md: "1.25rem",
                        },
                        whiteSpace: "nowrap",
                      }}
                    >
                      -{formatAmount(expense.amount)}
                    </Typography>
                  </Box>

                  {expense.status === "PENDING" && (
                    <Tooltip title="Mark as Settled">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettleIndividual(expense.id);
                        }}
                        sx={{
                          bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                          "&:hover": {
                            bgcolor: (t) => alpha(t.palette.success.main, 0.2),
                          },
                        }}
                      >
                        <CheckCircle2 size={22} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Card>
        ))}

        {paginatedExpenses.length === 0 && (
          <EmptyState
            icon={BanknoteArrowDown}
            title="No expenses found"
            description="Try adjusting your filter or add a new expense to get started."
          />
        )}
      </Stack>
      <PricingDialog
        open={pricingDialogOpen}
        onClose={() => setPricingDialogOpen(false)}
        title="Expense Limit Reached"
        message="You've reached the maximum number of expenses for your current plan. Upgrade to continue tracking expenses."
        limitType="expense"
      />
    </DashboardLayout>
  );
}
