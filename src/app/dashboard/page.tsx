"use client";

import * as React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Skeleton,
  alpha,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { TrendingUp, Wallet, Calculator, TrendingDown } from "lucide-react";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import { startOfMonth, endOfMonth } from "date-fns";
import { usePropertyStore } from "@/store/usePropertyStore";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { BLUE, GREEN, ORANGE, RED } from "@/theme";

const StatCard = ({
  title,
  amount,
  icon: Icon,
  trend,
  color,
  loading,
}: {
  title: string;
  amount: string;
  icon: React.ElementType;
  trend?: string;
  color?: string;
  loading?: boolean;
}) => (
  <Card
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}
  >
    <CardContent sx={{ p: 3, flexGrow: 1 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            backgroundColor: alpha(color || BLUE, 0.1),
            color: color || BLUE,
            display: "flex",
          }}
        >
          <Icon size={24} />
        </Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Stack>
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      ) : (
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
          {amount}
        </Typography>
      )}
      {loading ? (
        <Skeleton variant="text" width="40%" height={20} />
      ) : (
        trend && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box
              component="span"
              sx={{
                color: trend.startsWith("+") ? "success.main" : "error.main",
                fontWeight: 700,
                mr: 0.5,
              }}
            >
              {trend}
            </Box>
            from last period
          </Typography>
        )
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { formatAmount } = useCurrency();
  const { selectedProperty } = usePropertyStore();

  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<{
    totalRevenue: { value: number; trend: string };
    totalExpenses: { value: number; trend: string };
    netProfit: { value: number; trend: string };
    profitMargin: { value: string; trend: string };
  } | null>(null);

  React.useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        const data = await getDashboardStats({
          propertyId: selectedProperty?.id,
          startDate: dateRange.start || undefined,
          endDate: dateRange.end || undefined,
        });
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, [selectedProperty?.id, dateRange]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Overview"
        subtitle="Real-time summary of your property performance"
        actions={<MonthFilter value={dateRange} onChange={setDateRange} />}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Total Revenue"
            amount={formatAmount(stats?.totalRevenue.value || 0)}
            icon={TrendingUp}
            trend={stats?.totalRevenue.trend}
            color={GREEN}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Net Profit"
            amount={formatAmount(stats?.netProfit.value || 0)}
            icon={Wallet}
            trend={stats?.netProfit.trend}
            color={BLUE}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Total Expenses"
            amount={formatAmount(stats?.totalExpenses.value || 0)}
            icon={TrendingDown}
            trend={stats?.totalExpenses.trend}
            color={RED}
            loading={isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            title="Profit Margin"
            amount={stats?.profitMargin.value || "0%"}
            icon={Calculator}
            trend={stats?.profitMargin.trend}
            color={ORANGE}
            loading={isLoading}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
