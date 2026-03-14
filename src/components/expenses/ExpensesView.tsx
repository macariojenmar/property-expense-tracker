"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  alpha,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  BanknoteArrowDown,
  Calendar,
  FileText,
  ChevronRight,
  ChevronLeft,
  Trash2,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import MonthFilter, { DateRange } from "@/components/MonthFilter";

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

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { usePropertyStore } from "@/store/usePropertyStore";

interface ExpensesViewProps {
  propertyId: number | null;
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
  const [open, setOpen] = React.useState(false);
  const [newItems, setNewItems] = React.useState([
    {
      id: 1,
      name: "",
      amount: "",
      date: new Date(),
      note: "",
    },
  ]);
  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date(),
    type: "this-month",
  });
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

  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredExpenses = React.useMemo(() => {
    return mockExpenses.filter((expense) => {
      // Filter by propertyId if provided
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
  }, [filterRange, propertyId]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const totalAmount = React.useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

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
              onClick={() => setOpen(true)}
              fullWidth
              sx={{ height: 44, whiteSpace: "nowrap" }}
            >
              Add Expense
            </Button>
          </Box>
        </Stack>
      </Box>

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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div">
            Add New Expenses
          </Typography>
          <Button
            startIcon={<Plus size={16} />}
            onClick={() =>
              setNewItems([
                ...newItems,
                {
                  id: Date.now(),
                  name: "",
                  amount: "",
                  date: new Date(),
                  note: "",
                },
              ])
            }
            size="small"
            variant="outlined"
          >
            Add Row
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {newItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                p: 3,
                borderBottom: index < newItems.length - 1 ? 1 : 0,
                borderColor: "divider",
                position: "relative",
              }}
            >
              {newItems.length > 1 && (
                <IconButton
                  size="small"
                  onClick={() =>
                    setNewItems(newItems.filter((i) => i.id !== item.id))
                  }
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
              <Stack spacing={2} sx={{ mt: newItems.length > 1 ? 2 : 0 }}>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Autocomplete
                      fullWidth
                      freeSolo
                      options={dictionary}
                      value={item.name}
                      onChange={(e, newValue) =>
                        setNewItems(
                          newItems.map((i) =>
                            i.id === item.id
                              ? { ...i, name: newValue || "" }
                              : i,
                          ),
                        )
                      }
                      onInputChange={(e, newInputValue) =>
                        setNewItems(
                          newItems.map((i) =>
                            i.id === item.id
                              ? { ...i, name: newInputValue }
                              : i,
                          ),
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Expense Name"
                          placeholder="e.g. Transpo, Cleaning, Supplies"
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
                        setNewItems(
                          newItems.map((i) =>
                            i.id === item.id
                              ? { ...i, amount: e.target.value }
                              : i,
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
                        setNewItems(
                          newItems.map((i) =>
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
                  <Grid size={12}>
                    <TextField
                      fullWidth
                      label="Note"
                      multiline
                      rows={2}
                      placeholder="Add any additional details..."
                      value={item.note}
                      onChange={(e) =>
                        setNewItems(
                          newItems.map((i) =>
                            i.id === item.id
                              ? { ...i, note: e.target.value }
                              : i,
                          ),
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              setNewItems([
                {
                  id: Date.now(),
                  name: "",
                  amount: "",
                  date: new Date(),
                  note: "",
                },
              ]);
            }}
            variant="contained"
          >
            Save Expenses
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
