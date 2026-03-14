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
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Calendar,
  ChevronRight,
  ChevronLeft,
  WalletCards,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";

const mockPayouts = [
  { id: 1, amount: 15250, date: "2026-03-08", propertyId: 1 },
  { id: 2, amount: 12100, date: "2026-02-28", propertyId: 2 },
  { id: 3, amount: 18400, date: "2026-03-20", propertyId: 1 },
  { id: 4, amount: 14200, date: "2026-03-25", propertyId: 2 },
  { id: 5, amount: 9800, date: "2026-03-28", propertyId: 1 },
  { id: 6, amount: 16500, date: "2026-03-30", propertyId: 2 },
];

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePropertyStore } from "@/store/usePropertyStore";

interface PayoutsViewProps {
  propertyId: number | null;
}

export default function PayoutsView({ propertyId }: PayoutsViewProps) {
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
  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date(),
    type: "this-month",
  });

  // Pagination state
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 5;

  const filteredPayouts = React.useMemo(() => {
    return mockPayouts.filter((payout) => {
      // Filter by propertyId if provided
      if (propertyId !== null && payout.propertyId !== propertyId) {
        return false;
      }

      const payoutDate = parseISO(payout.date);
      if (filterRange.start && filterRange.end) {
        return (
          payoutDate >= startOfMonth(filterRange.start) &&
          payoutDate <= endOfDay(filterRange.end)
        );
      }
      return true;
    });
  }, [filterRange, propertyId]);

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
              Payouts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your earnings and payouts.
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
              onClick={() => router.push(`/properties/${propertyId}/payouts/create`)}
              fullWidth
              sx={{ height: 44, whiteSpace: "nowrap" }}
            >
              Add Payout
            </Button>
          </Box>
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
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
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


    </DashboardLayout>
  );
}
