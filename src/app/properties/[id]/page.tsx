"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Stack,
  Button,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  Receipt,
  MapPin,
  Settings,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import { startOfMonth, endOfMonth } from "date-fns";
import { getProperty } from "@/lib/actions/property";
import Loader from "@/components/Loader";

const FinanceCard = ({
  title,
  icon: Icon,
  currentValue,
  estimatedValue,
  color,
  formatAmount,
  onAction,
}: {
  title: string;
  icon: any;
  currentValue: number;
  estimatedValue: number;
  color: string;
  formatAmount: (val: number) => string;
  onAction?: () => void;
}) => {
  return (
    <Card
      onClick={onAction}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s",
        cursor: onAction ? "pointer" : "default",
        "&:hover": {
          bgcolor: (theme) => alpha(color, 0.05),
        },
        border: "1px solid",
        borderColor: alpha(color, 0.1),
        bgcolor: "transparent",
      }}
    >
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(color, 0.1),
                color: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={24} />
            </Box>
            <Typography variant="h6" fontWeight={600} color="text.secondary">
              {title}
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                letterSpacing: "-0.02em",
                color: currentValue < 0 ? "#f43f5e" : "text.primary",
              }}
            >
              {formatAmount(currentValue)}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Current {title}
            </Typography>
          </Box>

          <Divider sx={{ my: 1, borderStyle: "dashed" }} />

          <Box>
            <Typography
              variant="h6"
              fontWeight={600}
              color={estimatedValue < 0 ? "#f43f5e" : color}
              sx={{ opacity: 0.9 }}
            >
              {formatAmount(estimatedValue)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              Estimated {title}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function PropertyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { properties, setSelectedProperty, selectedProperty, setProperties } =
    usePropertyStore();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = React.useState(true);
  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });

  const propertyId = typeof params.id === "string" ? params.id : null;

  React.useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      setLoading(true);
      try {
        const data = await getProperty(propertyId);
        if (data) {
          setSelectedProperty(data as any);
          // Also update in properties list if it exists
          setProperties(
            properties.map((p) => (p.id === propertyId ? (data as any) : p)),
          );
        }
      } catch (error) {
        console.error("Failed to fetch property:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId, setSelectedProperty, setProperties]);

  const property = selectedProperty;

  const stats = React.useMemo(() => {
    if (!property || !filterRange.start || !filterRange.end) {
      return {
        currentProfit: 0,
        estimatedProfit: 0,
        currentFunds: 0,
        estimatedFunds: 0,
        currentExpenses: 0,
        estimatedExpenses: 0,
      };
    }

    const { start, end } = filterRange;

    // Filter transactions by date range
    const rangeExpenses = (property.expenses as any[]).filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const rangePayouts = (property.payouts as any[]).filter((p) => {
      const d = new Date(p.date);
      return d >= start && d <= end;
    });

    // Current Values for the range
    const currentExpenses = rangeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const rangePayoutTotal = rangePayouts.reduce(
      (sum, p) => sum + (p.amount - (p.refundAmount || 0)),
      0,
    );
    const currentProfit = rangePayoutTotal - currentExpenses;

    // Funds is cumulative up to the 'end' date
    const allPriorExpenses = (property.expenses as any[]).filter(
      (e) => new Date(e.date) <= end,
    );
    const allPriorPayouts = (property.payouts as any[]).filter(
      (p) => new Date(p.date) <= end,
    );
    const cumulativeProfit =
      allPriorPayouts.reduce(
        (sum, p) => sum + (p.amount - (p.refundAmount || 0)),
        0,
      ) - allPriorExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentFunds = (property.initialFunds || 0) + cumulativeProfit;

    // Estimations
    // For simplicity, we estimate by adding pending recurring expenses if the range includes the current/future months
    const now = new Date();
    let estimatedAddon = 0;

    // Only add recurring expenses if the filter end date is at least the end of this month
    if (end >= startOfMonth(now)) {
      const recurring = (property.recurringExpenses as any[]) || [];
      const waived = (property.waivedRecurringExpenses as any[]) || [];

      recurring.forEach((re) => {
        // Check if this recurring expense has already been recorded in THIS month
        // In a real app, we'd check if an expense with type 'RECURRING' and this name exists for this month
        // For now, let's assume if it's not waived and we are looking at this month, it's an estimated expense
        const isWaived = waived.some(
          (w) =>
            w.recurringExpenseId === re.id &&
            new Date(w.date).getMonth() === now.getMonth() &&
            new Date(w.date).getFullYear() === now.getFullYear(),
        );

        const alreadyRecorded = rangeExpenses.some((e) => e.name === re.name); // Simple heuristic

        if (!isWaived && !alreadyRecorded) {
          estimatedAddon += re.amount;
        }
      });
    }

    return {
      currentProfit,
      estimatedProfit: currentProfit - estimatedAddon, // Profit decreases with more expenses
      currentFunds,
      estimatedFunds: currentFunds - estimatedAddon,
      currentExpenses,
      estimatedExpenses: currentExpenses + estimatedAddon,
    };
  }, [property, filterRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <Loader message="Loading property details..." />
      </DashboardLayout>
    );
  }

  if (!property || property.id !== propertyId) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5">Property not found</Typography>
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push("/properties")}
            sx={{ mt: 2 }}
          >
            Back to Properties
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.push("/properties")}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Back to Properties
        </Button>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                mb: 1,
                letterSpacing: "-0.02em",
                fontSize: { xs: "2rem", sm: "3rem" },
              }}
            >
              {property.name}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              color="text.secondary"
            >
              <MapPin size={18} />
              <Typography variant="body1">{property.location}</Typography>
            </Stack>
          </Box>

          <Button
            variant="outlined"
            size="small"
            startIcon={<Settings size={18} />}
            onClick={() => router.push(`/properties/${property.id}/edit`)}
            sx={{
              alignSelf: { xs: "stretch", sm: "center" },
              px: 3,
            }}
          >
            Edit Property
          </Button>
        </Stack>
      </Box>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6">Overview</Typography>
        <MonthFilter value={filterRange} onChange={setFilterRange} />
      </Stack>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Funds"
            icon={Wallet}
            currentValue={stats.currentFunds}
            estimatedValue={stats.estimatedFunds}
            color="#3b82f6"
            formatAmount={formatAmount}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Profit"
            icon={TrendingUp}
            currentValue={stats.currentProfit}
            estimatedValue={stats.estimatedProfit}
            color="#10b981"
            formatAmount={formatAmount}
            onAction={() => router.push(`/properties/${property.id}/payouts`)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Expenses"
            icon={Receipt}
            currentValue={stats.currentExpenses}
            estimatedValue={stats.estimatedExpenses}
            color="#f43f5e"
            formatAmount={formatAmount}
            onAction={() => router.push(`/properties/${property.id}/expenses`)}
          />
        </Grid>
      </Grid>

      {/* Recurring Expenses */}
      {property.recurringExpenses && property.recurringExpenses.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Recurring Expenses
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: alpha("#f43f5e", 0.15),
                  bgcolor: "transparent",
                }}
              >
                <CardContent>
                  <Stack spacing={0}>
                    {property.recurringExpenses.map((exp, index) => (
                      <Box key={index}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ py: 1.5 }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                p: 0.75,
                                borderRadius: 1.5,
                                bgcolor: alpha("#f43f5e", 0.1),
                                color: "#f43f5e",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Receipt size={16} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {exp.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                                    • {exp.pendingTo.name}
                                  </Box>
                                )}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography
                            variant="body1"
                            fontWeight={700}
                            color="#f43f5e"
                            sx={{ opacity: 0.9 }}
                          >
                            {formatAmount(exp.amount)}
                          </Typography>
                        </Stack>
                        {index < property.recurringExpenses.length - 1 && (
                          <Divider sx={{ borderStyle: "dashed" }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </DashboardLayout>
  );
}
