"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import { TrendingUp, Clock, Percent, PieChart, Info } from "lucide-react";
import { Expense, Payout } from "@/store/usePropertyStore";

interface CompactFinancialStatsProps {
  expenses: Expense[];
  payouts: Payout[];
  formatAmount: (val: number) => string;
}

const StatItem = ({
  icon: Icon,
  label,
  value,
  color,
  description,
  isPercent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
  description: string;
  isPercent?: boolean;
}) => {
  const theme = useTheme();
  const displayColor = color || theme.palette.text.primary;

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={0.5}
      sx={{ flex: 1 }}
    >
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1.5,
          bgcolor: alpha(displayColor, 0.1),
          color: displayColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 0.5,
        }}
      >
        <Icon size={16} />
      </Box>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={500}
          noWrap
        >
          {label}
        </Typography>
        <Tooltip title={description} placement="top">
          <Box sx={{ color: "text.secondary", opacity: 0.6, cursor: "help", display: "flex" }}>
            <Info size={14} />
          </Box>
        </Tooltip>
      </Stack>
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: displayColor, lineHeight: 1.2 }}
      >
        {value}
        {isPercent && "%"}
      </Typography>
    </Stack>
  );
};

export default function CompactFinancialStats({
  expenses,
  payouts,
  formatAmount,
}: CompactFinancialStatsProps) {
  const stats = React.useMemo(() => {
    const totalPayouts = payouts.reduce(
      (sum, p) => sum + (p.amount - (p.refundAmount || 0)),
      0,
    );
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netCashFlow = totalPayouts - totalExpenses;
    const pendingExpenses = expenses
      .filter((e) => e.status === "PENDING")
      .reduce((sum, e) => sum + e.amount, 0);

    const profitMargin =
      totalPayouts > 0 ? (netCashFlow / totalPayouts) * 100 : 0;
    const expenseRatio =
      totalPayouts > 0 ? (totalExpenses / totalPayouts) * 100 : 0;

    return {
      netCashFlow,
      pendingExpenses,
      profitMargin: profitMargin.toFixed(1),
      expenseRatio: expenseRatio.toFixed(1),
    };
  }, [expenses, payouts]);

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: (t) => alpha(t.palette.divider, 0.1),
        bgcolor: "transparent",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{
          width: "100%",
          py: "24px !important",
          flex: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          alignItems="center"
          sx={{ width: "100%" }}
          spacing={0}
        >
          <Box sx={{ width: { xs: "50%", sm: "50%", md: "50%" }, mb: 4 }}>
            <StatItem
              icon={TrendingUp}
              label="Net Cash Flow"
              value={formatAmount(stats.netCashFlow)}
              description="The actual cash generated or consumed by the property in the selected period."
              color={
                stats.netCashFlow > 0
                  ? "#10b981"
                  : stats.netCashFlow < 0
                    ? "#f43f5e"
                    : undefined
              }
            />
          </Box>
          <Box sx={{ width: { xs: "50%", sm: "50%", md: "50%" }, mb: 4 }}>
            <StatItem
              icon={Clock}
              label="Pending"
              value={formatAmount(stats.pendingExpenses)}
              description="Total amount of expenses that are currently in 'PENDING' status."
              color={stats.pendingExpenses > 0 ? "#f59e0b" : undefined}
            />
          </Box>
          <Box sx={{ width: { xs: "50%", sm: "50%", md: "50%" } }}>
            <StatItem
              icon={Percent}
              label="Profit Margin"
              value={stats.profitMargin}
              description="Percentage of payouts that remains as profit after all expenses."
              isPercent
              color={
                Number(stats.profitMargin) > 0
                  ? "#10b981"
                  : Number(stats.profitMargin) < 0
                    ? "#f43f5e"
                    : undefined
              }
            />
          </Box>
          <Box sx={{ width: { xs: "50%", sm: "50%", md: "50%" } }}>
            <StatItem
              icon={PieChart}
              label="Expense Ratio"
              value={stats.expenseRatio}
              description="Percentage of payouts that goes towards paying expenses."
              isPercent
              color={Number(stats.expenseRatio) > 30 ? "#f59e0b" : undefined}
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
