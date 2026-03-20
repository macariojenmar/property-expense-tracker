"use client";

import React, { useState } from "react";
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
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ArrowLeft,
  TrendingUp,
  Wallet,
  Receipt,
  Settings,
  Info,
  PackageOpen,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import { startOfMonth, endOfMonth, format } from "date-fns";
import Loader from "@/components/Loader";
import CompactFinancialStats from "@/components/CompactFinancialStats";
import { BLUE, GREEN, RED } from "@/theme";

const FinanceCard = ({
  title,
  icon: Icon,
  currentValue,
  estimatedValue,
  color,
  formatAmount,
  description,
  onAction,
}: {
  title: string;
  icon: React.ElementType;
  currentValue: number;
  estimatedValue: number;
  color: string;
  formatAmount: (val: number) => string;
  description: string;
  onAction?: () => void;
}) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };
  return (
    <Card
      onClick={onAction}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s",
        cursor: onAction ? "pointer" : "default",
        "&:hover": { bgcolor: alpha(color, 0.05) },
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
            <Tooltip
              title={description}
              placement="top"
              open={open}
              onClose={handleTooltipClose}
              disableHoverListener
            >
              <IconButton onClick={handleTooltipToggle}>
                <Info size={16} color="grey" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Box>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{
                letterSpacing: "-0.02em",
                color: currentValue < 0 ? RED : "text.primary",
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
              color={estimatedValue < 0 ? RED : color}
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
  const { properties, setSelectedProperty, selectedProperty, isLoading } =
    usePropertyStore();
  const { formatAmount } = useCurrency();
  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });

  const propertyId = typeof params.id === "string" ? params.id : null;

  React.useEffect(() => {
    if (propertyId && properties.length > 0) {
      const found = properties.find((p) => p.id === propertyId);
      if (found) {
        setSelectedProperty(found);
      }
    }
  }, [propertyId, properties, setSelectedProperty]);

  const property = selectedProperty;

  const rangeData = React.useMemo(() => {
    if (!property || !filterRange.start || !filterRange.end) {
      return {
        expenses: [],
        payouts: [],
        currentExpenses: 0,
        currentProfit: 0,
      };
    }

    const { start, end } = filterRange;

    // Filter transactions by date range
    const rangeExpenses = (property.expenses || []).filter((e) => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const rangePayouts = (property.payouts || []).filter((p) => {
      const d = new Date(p.date);
      return d >= start && d <= end;
    });

    return {
      expenses: rangeExpenses,
      payouts: rangePayouts,
      currentExpenses: rangeExpenses.reduce((sum, e) => sum + e.amount, 0),
      currentProfit:
        rangePayouts.reduce(
          (sum, p) => sum + (p.amount - (p.refundAmount || 0)),
          0,
        ) - rangeExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }, [property, filterRange]);

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

    const { end } = filterRange;
    const {
      expenses: rangeExpenses,
      currentExpenses,
      currentProfit,
    } = rangeData;

    // Funds is cumulative up to the 'end' date
    const allPriorExpenses = (property.expenses || []).filter(
      (e) => new Date(e.date) <= end,
    );
    const allPriorPayouts = (property.payouts || []).filter(
      (p) => new Date(p.date) <= end,
    );
    const cumulativeProfit =
      allPriorPayouts.reduce(
        (sum, p) => sum + (p.amount - (p.refundAmount || 0)),
        0,
      ) - allPriorExpenses.reduce((sum, e) => sum + e.amount, 0);
    const currentFunds = (property.initialFunds || 0) + cumulativeProfit;

    // Estimations
    const now = new Date();
    let estimatedAddon = 0;

    if (end >= startOfMonth(now)) {
      const recurring = property.recurringExpenses || [];
      const waived = property.waivedRecurringExpenses || [];

      recurring.forEach((re) => {
        const isWaived = waived.some(
          (w) =>
            w.recurringExpenseId === re.id &&
            w.monthKey === format(now, "yyyy-MM"),
        );

        const alreadyRecorded = rangeExpenses.some((e) => e.name === re.name);

        if (!isWaived && !alreadyRecorded) {
          estimatedAddon += re.amount;
        }
      });
    }

    return {
      currentProfit,
      estimatedProfit: currentProfit - estimatedAddon,
      currentFunds,
      estimatedFunds: currentFunds - estimatedAddon,
      currentExpenses,
      estimatedExpenses: currentExpenses + estimatedAddon,
    };
  }, [property, filterRange, rangeData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loader message="Loading property details..." />
      </DashboardLayout>
    );
  }

  if (!property || property.id !== propertyId) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "70vh",
          }}
        >
          <PackageOpen size={48} />
          <Typography variant="h5" mb={1} mt={2}>
            Oops! Property not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The property you are looking for does not exist.
          </Typography>
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
      <PageHeader
        title={property.name}
        subtitle={property.location || undefined}
        onBack={() => router.push("/properties")}
        actions={
          <Button
            variant="outlined"
            size="small"
            startIcon={<Settings size={18} />}
            onClick={() => router.push(`/properties/${property.id}/edit`)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Edit Property
          </Button>
        }
      />

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
            color={BLUE}
            formatAmount={formatAmount}
            description="Total cash available for the property, including initial funds and all net profits to date."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Profit"
            icon={TrendingUp}
            currentValue={stats.currentProfit}
            estimatedValue={stats.estimatedProfit}
            color={GREEN}
            formatAmount={formatAmount}
            description="Net income for the selected period (Payouts minus Expenses)."
            onAction={() => router.push(`/properties/${property.id}/payouts`)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Expenses"
            icon={Receipt}
            currentValue={stats.currentExpenses}
            estimatedValue={stats.estimatedExpenses}
            color={RED}
            formatAmount={formatAmount}
            description="Total costs incurred during the selected period."
            onAction={() => router.push(`/properties/${property.id}/expenses`)}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Financial Health
            </Typography>
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <CompactFinancialStats
                expenses={rangeData.expenses}
                payouts={rangeData.payouts}
                formatAmount={formatAmount}
              />
            </Box>
          </Grid>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recurring Expenses
            </Typography>
            <Card
              sx={{
                border: "1px solid",
                borderColor: alpha(RED, 0.15),
                bgcolor: "transparent",
                mb: { xs: 2, md: 0 },
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent>
                {property.recurringExpenses &&
                property.recurringExpenses.length > 0 ? (
                  <Stack spacing={0}>
                    {property.recurringExpenses.map((exp, index) => (
                      <Box key={index}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ py: 1 }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                p: 0.5,
                                borderRadius: 1.25,
                                bgcolor: alpha(RED, 0.1),
                                color: RED,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Receipt size={14} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {exp.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Day {exp.day}
                              </Typography>
                            </Box>
                          </Stack>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={RED}
                          >
                            {formatAmount(exp.amount)}
                          </Typography>
                        </Stack>
                        {index < property.recurringExpenses.length - 1 && (
                          <Divider
                            sx={{ borderStyle: "dashed", opacity: 0.5 }}
                          />
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                    }}
                  >
                    <Stack alignItems={"center"}>
                      <PackageOpen size={20} strokeWidth={1.5} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ pt: 1 }}
                      >
                        No recurring expenses
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Add recurring expenses to this property
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}
