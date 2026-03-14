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
import { ArrowLeft, TrendingUp, Wallet, Receipt, MapPin } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usePropertyStore } from "@/store/usePropertyStore";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";
import { startOfMonth } from "date-fns";

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
              sx={{ letterSpacing: "-0.02em" }}
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
              color={color}
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
  const { properties, setSelectedProperty, selectedProperty } =
    usePropertyStore();
  const { formatAmount } = useCurrency();
  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date(),
    type: "this-month",
  });

  const propertyId = typeof params.id === "string" ? parseInt(params.id) : null;
  const property = properties.find((p: any) => p.id === propertyId);

  // Initialize store if we're on a property-specific page but no property is selected
  React.useEffect(() => {
    if (
      propertyId &&
      (!selectedProperty || selectedProperty.id !== propertyId)
    ) {
      if (property) {
        setSelectedProperty(property);
      }
    }
  }, [propertyId, selectedProperty, property, setSelectedProperty]);

  if (!property) {
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
          <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
            <MonthFilter value={filterRange} onChange={setFilterRange} />
          </Box>
        </Stack>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Overview
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Funds"
            icon={Wallet}
            currentValue={property.funds}
            estimatedValue={property.estimatedFunds}
            color="#3b82f6"
            formatAmount={formatAmount}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Profit"
            icon={TrendingUp}
            currentValue={property.profit}
            estimatedValue={property.estimatedProfit}
            color="#10b981"
            formatAmount={formatAmount}
            onAction={() => router.push(`/properties/${property.id}/payouts`)}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FinanceCard
            title="Expenses"
            icon={Receipt}
            currentValue={property.currentExpense}
            estimatedValue={property.estimatedExpense}
            color="#f43f5e"
            formatAmount={formatAmount}
            onAction={() => router.push(`/properties/${property.id}/expenses`)}
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
