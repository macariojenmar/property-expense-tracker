"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  InputAdornment,
  IconButton,
  alpha,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Banknote,
  Calendar,
  ChevronRight,
  ChevronLeft,
  WalletCards,
} from "lucide-react";
import { format, isSameMonth, parseISO } from "date-fns";
import { useCurrency } from "@/components/CurrencyContext";
import NumericFormatInput from "@/components/NumericFormatInput";
import MonthFilter from "@/components/MonthFilter";

const mockPayouts = [
  { id: 1, amount: 15250, date: "2026-03-08" },
  { id: 2, amount: 12100, date: "2026-02-28" },
  { id: 3, amount: 18400, date: "2026-03-20" },
  { id: 4, amount: 14200, date: "2026-03-25" },
  { id: 5, amount: 9800, date: "2026-03-28" },
  { id: 6, amount: 16500, date: "2026-03-30" },
];

export default function PayoutsPage() {
  const { formatAmount, currency } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(
    new Date(),
  );
  const [filterDate, setFilterDate] = React.useState<Date | null>(new Date());

  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredPayouts = React.useMemo(() => {
    if (!filterDate) return mockPayouts;
    return mockPayouts.filter((payout) =>
      isSameMonth(parseISO(payout.date), filterDate),
    );
  }, [filterDate]);

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const totalAmount = React.useMemo(() => {
    return filteredPayouts.reduce((sum, payout) => sum + payout.amount, 0);
  }, [filteredPayouts]);

  return (
    <DashboardLayout>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Payouts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your earnings and payouts.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <MonthFilter value={filterDate} onChange={setFilterDate} />
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpen(true)}
          >
            Add Payout
          </Button>
        </Stack>
      </Box>

      {(totalPages > 1 || filteredPayouts.length > 0) && (
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
            sx={{ fontWeight: 700, color: "success.main" }}
          >
            Total: {formatAmount(totalAmount)}
          </Typography>

          {totalPages > 1 && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {(page - 1) * itemsPerPage + 1}–
                {Math.min(page * itemsPerPage, filteredPayouts.length)} of{" "}
                {filteredPayouts.length}
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
        {paginatedPayouts.map((payout) => (
          <Card
            key={payout.id}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "all 0.2s",
              cursor: "pointer",
              "&:hover": {
                borderColor: "success.main",
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.02),
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
                      ? alpha(theme.palette.success.main, 0.1)
                      : alpha(theme.palette.success.main, 0.2),
                  borderRadius: 2,
                  color: "success.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WalletCards size={22} />
              </Box>

              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Property Payout
                </Typography>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ color: "text.secondary", mt: 0.5 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Calendar size={14} />
                    <Typography variant="caption">
                      {format(new Date(payout.date), "MMMM d, yyyy")}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              <Box sx={{ textAlign: "right", minWidth: 120, mr: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "success.main" }}
                >
                  {formatAmount(payout.amount)}
                </Typography>
              </Box>

              <ChevronRight size={20} color="gray" />
            </Stack>
          </Card>
        ))}

        {paginatedPayouts.length === 0 && (
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
              No payouts found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filter or record a new payout.
            </Typography>
          </Card>
        )}
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Record Payout</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="MMMM d, yyyy"
              slotProps={{ textField: { fullWidth: true } }}
            />
            <NumericFormatInput
              fullWidth
              label="Amount"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currency.symbol}
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)} variant="contained">
            Record Payout
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
