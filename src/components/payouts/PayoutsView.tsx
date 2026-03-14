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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Chip,
  Tooltip,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Calendar,
  ChevronRight,
  ChevronLeft,
  WalletCards,
  Undo2,
  History,
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfDay } from "date-fns";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePropertyStore, Payout } from "@/store/usePropertyStore";
import NumericFormatInput from "@/components/NumericFormatInput";

interface PayoutsViewProps {
  propertyId: number | null;
}

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  payout: Payout | null;
  onRefund: (amount: number) => void;
}

function RefundDialog({ open, onClose, payout, onRefund }: RefundDialogProps) {
  const { currency } = useCurrency();
  const [refundType, setRefundType] = React.useState<"full" | "custom">("full");
  const [customAmount, setCustomAmount] = React.useState("");

  if (!payout) return null;

  const remainingAmount = payout.amount - (payout.refundAmount || 0);

  const handleConfirm = () => {
    const amount =
      refundType === "full" ? remainingAmount : parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0 && amount <= remainingAmount) {
      onRefund(amount);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Refund Payout</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Payout:{" "}
              <strong>
                {currency.symbol}
                {payout.amount.toLocaleString()}
              </strong>
            </Typography>
            {payout.refundAmount ? (
              <Typography variant="body2" color="error.main">
                Already Refunded:{" "}
                <strong>
                  {currency.symbol}
                  {payout.refundAmount.toLocaleString()}
                </strong>
              </Typography>
            ) : null}
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Remaining Amount:{" "}
              <strong>
                {currency.symbol}
                {remainingAmount.toLocaleString()}
              </strong>
            </Typography>
          </Box>

          <RadioGroup
            value={refundType}
            onChange={(e) => setRefundType(e.target.value as any)}
          >
            <FormControlLabel
              value="full"
              control={<Radio />}
              label={`Full Refund (${currency.symbol}${remainingAmount.toLocaleString()})`}
            />
            <FormControlLabel
              value="custom"
              control={<Radio />}
              label="Custom Amount"
            />
          </RadioGroup>

          {refundType === "custom" && (
            <NumericFormatInput
              fullWidth
              label="Refund Amount"
              value={customAmount}
              onChange={(e: any) => setCustomAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {currency.symbol}
                  </InputAdornment>
                ),
              }}
              autoFocus
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={refundType === "custom" && !customAmount}
        >
          Confirm Refund
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface RevertConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  payout: Payout | null;
}

function RevertConfirmationDialog({
  open,
  onClose,
  onConfirm,
  payout,
}: RevertConfirmationDialogProps) {
  const { formatAmount } = useCurrency();

  if (!payout) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Revert Refund?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to revert the refund for the payout of{" "}
          <strong>{formatAmount(payout.amount)}</strong>? This will restore the
          payout to its original status.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirm Revert
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function PayoutsView({ propertyId }: PayoutsViewProps) {
  const router = useRouter();
  const {
    properties,
    setSelectedProperty,
    selectedProperty,
    payouts,
    refundPayout,
    revertRefund,
  } = usePropertyStore();
  const { formatAmount, currency } = useCurrency();

  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = React.useState(false);
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(
    null,
  );

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
    return payouts.filter((payout) => {
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
  }, [filterRange, propertyId, payouts]);

  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);
  const paginatedPayouts = filteredPayouts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

  const totalAmount = React.useMemo(() => {
    return filteredPayouts.reduce((sum, payout) => {
      const amount = payout.amount - (payout.refundAmount || 0);
      return sum + amount;
    }, 0);
  }, [filteredPayouts]);

  const handleRefundClick = (e: React.MouseEvent, payout: Payout) => {
    e.stopPropagation();
    setSelectedPayout(payout);
    setRefundDialogOpen(true);
  };

  const handleRefundConfirm = (amount: number) => {
    if (selectedPayout) {
      refundPayout(selectedPayout.id, amount);
    }
  };

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
              onClick={() =>
                router.push(`/properties/${propertyId}/payouts/create`)
              }
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
        {paginatedPayouts.map((payout) => {
          const isRefunded = payout.status === "refunded";
          const isPartiallyRefunded = payout.status === "partially-refunded";
          const displayAmount = payout.amount - (payout.refundAmount || 0);

          return (
            <Card
              key={payout.id}
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s",
                position: "relative",
                bgcolor: isRefunded
                  ? (theme) =>
                      alpha(theme.palette.action.disabledBackground, 0.05)
                  : "background.paper",
                "&:hover": {
                  bgcolor: (theme) =>
                    isRefunded
                      ? alpha(theme.palette.action.disabledBackground, 0.08)
                      : alpha(theme.palette.success.main, 0.04),
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
                      isRefunded
                        ? alpha(theme.palette.action.disabled, 0.1)
                        : theme.palette.mode === "light"
                          ? alpha(theme.palette.success.main, 0.1)
                          : alpha(theme.palette.success.main, 0.2),
                    borderRadius: 2,
                    color: isRefunded ? "text.disabled" : "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <WalletCards size={22} />
                </Box>

                <Box sx={{ minWidth: 200, flexGrow: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: isRefunded ? "text.disabled" : "text.primary",
                        textDecoration: isRefunded ? "line-through" : "none",
                      }}
                    >
                      Property Payout
                    </Typography>
                    {isRefunded && (
                      <Chip
                        label="Refunded"
                        size="small"
                        color="error"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                    {isPartiallyRefunded && (
                      <Chip
                        label="Partially Refunded"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    )}
                  </Stack>
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
                    {isPartiallyRefunded && (
                      <Typography variant="caption" color="error.main">
                        Refunded: {formatAmount(payout.refundAmount || 0)}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ textAlign: "right", minWidth: 120, mr: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isRefunded ? "text.disabled" : "success.main",
                    }}
                  >
                    {formatAmount(displayAmount)}
                  </Typography>
                </Box>

                {(isRefunded || isPartiallyRefunded) && (
                  <Tooltip title="Revert Refund" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPayout(payout);
                        setRevertDialogOpen(true);
                      }}
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "primary.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.primary.main, 0.08),
                        },
                      }}
                    >
                      <History size={18} />
                    </IconButton>
                  </Tooltip>
                )}

                {(!isRefunded && !isPartiallyRefunded) && (
                  <Tooltip title="Refund Payout" arrow>
                    <IconButton
                      size="small"
                      onClick={(e) => handleRefundClick(e, payout)}
                      sx={{
                        color: "text.secondary",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: (theme) =>
                            alpha(theme.palette.error.main, 0.08),
                        },
                      }}
                    >
                      <Undo2 size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Card>
          );
        })}

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

      <RefundDialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        payout={selectedPayout}
        onRefund={handleRefundConfirm}
      />

      <RevertConfirmationDialog
        open={revertDialogOpen}
        onClose={() => setRevertDialogOpen(false)}
        payout={selectedPayout}
        onConfirm={() => {
          if (selectedPayout) {
            revertRefund(selectedPayout.id);
          }
          setRevertDialogOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
