"use client";

import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  alpha,
  CircularProgress,
} from "@mui/material";
import { useCurrency } from "@/components/CurrencyContext";
import { getYearlyExpenseStats } from "@/lib/actions/expense";
import { getYearlyPayoutStats } from "@/lib/actions/payout";

interface YearlyStatsDialogProps {
  open: boolean;
  onClose: () => void;
  propertyId: string | null;
  type: "expenses" | "payouts" | "profits";
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function YearlyStatsDialog({
  open,
  onClose,
  propertyId,
  type,
}: YearlyStatsDialogProps) {
  const { formatAmount } = useCurrency();
  const [data, setData] = React.useState<number[]>(Array(12).fill(0));
  const [loading, setLoading] = React.useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  React.useEffect(() => {
    if (open && propertyId) {
      setLoading(true);
      if (type === "expenses") {
        getYearlyExpenseStats(propertyId, currentYear)
          .then((res) => {
            if (res) setData(res);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      } else if (type === "payouts") {
        getYearlyPayoutStats(propertyId, currentYear)
          .then((res) => {
            if (res) setData(res);
          })
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      } else if (type === "profits") {
        Promise.all([
          getYearlyPayoutStats(propertyId, currentYear),
          getYearlyExpenseStats(propertyId, currentYear),
        ])
          .then(([payoutsRes, expensesRes]) => {
            if (payoutsRes && expensesRes) {
              const profits = payoutsRes.map((p, i) => p - expensesRes[i]);
              setData(profits);
            }
          })
          .catch((err) => console.error(err))
          .finally(() => setLoading(false));
      }
    } else {
      // Reset data when closed
      setData(Array(12).fill(0));
    }
  }, [open, propertyId, type, currentYear]);

  const total = data.reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {type === "expenses"
          ? "Monthly Expenses"
          : type === "payouts"
            ? "Monthly Payouts"
            : "Monthly Profits"}{" "}
        ({currentYear})
      </DialogTitle>
      <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 4,
              height: 400,
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <List sx={{ pt: 0, pb: 0, flex: 1, overflow: "auto" }}>
              {months.map((month, index) => {
                const isCurrentMonth = index === currentMonth;
                return (
                  <React.Fragment key={month}>
                    <ListItem
                      sx={{
                        py: 0.75,
                        px: 2.5,
                        bgcolor: isCurrentMonth
                          ? (theme) => alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                      }}
                    >
                      <ListItemText
                        primary={month + (isCurrentMonth ? " (Current)" : "")}
                        primaryTypographyProps={{
                          fontWeight: isCurrentMonth ? 800 : 500,
                          fontSize: "0.9rem",
                          color: isCurrentMonth
                            ? "primary.main"
                            : "text.primary",
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color:
                            (data[index] || 0) === 0
                              ? "text.disabled"
                              : type === "expenses"
                                ? "error.main"
                                : type === "payouts"
                                  ? "success.main"
                                  : (data[index] || 0) > 0
                                    ? "success.main"
                                    : "error.main",
                        }}
                      >
                        {formatAmount(data[index] || 0)}
                      </Typography>
                    </ListItem>
                    {index < months.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
            <Box
              sx={{
                bgcolor: (theme) => alpha(theme.palette.divider, 0.04),
                px: 2.5,
                py: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color:
                      total === 0
                        ? "text.secondary"
                        : type === "expenses"
                          ? "error.main"
                          : type === "payouts"
                            ? "success.main"
                            : total > 0
                              ? "success.main"
                              : "error.main",
                  }}
                >
                  {formatAmount(total)}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, pt: 1.5 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
