"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  TrendingUp,
  Wallet,
  Calculator,
  TrendingDown,
} from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import { startOfMonth, endOfMonth } from "date-fns";
import { usePropertyStore } from "@/store/usePropertyStore";
import EmptyState from "@/components/EmptyState";

const StatCard = ({
  title,
  amount,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  amount: string;
  icon: any;
  trend?: string;
  color?: string;
}) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      borderRadius: 4,
    }}
  >
    <CardContent sx={{ p: 3, flexGrow: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: `${color || "primary"}.lighter`,
            color: `${color || "primary"}.main`,
            display: "flex",
          }}
        >
          <Icon size={24} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
        {amount}
      </Typography>
      {trend && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
          {trend}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const { selectedProperty, properties } = usePropertyStore();
  const selectedPropertyId = selectedProperty?.id || null;

  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });

  return (
    <DashboardLayout title="Financial Dashboard">
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: "-0.02em" }}>
              Overview
            </Typography>
            <Typography color="text.secondary">
              Real-time summary of your property performance
            </Typography>
          </Box>
          <MonthFilter value={dateRange} onChange={setDateRange} />
        </Stack>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            amount={formatAmount(0)}
            icon={TrendingUp}
            trend="+0% from last month"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            amount={formatAmount(0)}
            icon={TrendingDown}
            trend="+0% from last month"
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Profit"
            amount={formatAmount(0)}
            icon={Wallet}
            trend="+0% from last month"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Profit Margin"
            amount="0%"
            icon={Calculator}
            trend="+0% from last month"
            color="warning"
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Expenses
        </Typography>
        <EmptyState
          icon={TrendingDown}
          title="No recent expenses"
          description="Start tracking your property expenditures to see them here."
        />
      </Box>
    </DashboardLayout>
  );
}
