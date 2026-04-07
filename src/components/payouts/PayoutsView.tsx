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
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  WalletCards,
  Undo2,
  History,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { format, startOfMonth, endOfMonth, endOfDay } from "date-fns";
import { useCurrency } from "@/components/CurrencyContext";
import MonthFilter, { DateRange } from "@/components/MonthFilter";

import { useRouter } from "next/navigation";
import { usePropertyStore, Property, Payout } from "@/store/usePropertyStore";
import {
  refundPayout as refundPayoutAction,
  revertRefund as revertRefundAction,
} from "@/lib/actions/payout";
import NumericFormatInput from "@/components/NumericFormatInput";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import YearlyStatsDialog from "@/components/YearlyStatsDialog";

// Local interfaces removed in favor of store interfaces

interface PayoutsViewProps {
  propertyId: string | null;
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

  const remainingAmount = payout
    ? payout.amount - (payout.refundAmount || 0)
    : 0;

  const previewRemaining = React.useMemo(() => {
    if (!payout) return 0;
    const amount =
      refundType === "full" ? remainingAmount : parseFloat(customAmount) || 0;
    return Math.max(0, remainingAmount - amount);
  }, [payout, refundType, remainingAmount, customAmount]);

  if (!payout) return null;

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
              Current Balance:{" "}
              <strong>
                {currency.symbol}
                {remainingAmount.toLocaleString()}
              </strong>
            </Typography>
            {(refundType === "full" || customAmount) && (
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "success.main", fontWeight: 600 }}
              >
                Remaining After Refund: {currency.symbol}
                {previewRemaining.toLocaleString()}
              </Typography>
            )}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setCustomAmount(e.target.value)
              }
              error={
                customAmount
                  ? parseFloat(customAmount) > remainingAmount
                  : false
              }
              helperText={
                customAmount && parseFloat(customAmount) > remainingAmount
                  ? "Amount exceeds remaining balance"
                  : ""
              }
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
          disabled={
            (refundType === "custom" && !customAmount) ||
            (refundType === "custom" &&
              parseFloat(customAmount) > remainingAmount)
          }
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
    refresh,
    setIsSaving,
    isFetchingDetails,
    fetchPropertyDetails,
  } = usePropertyStore();
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = React.useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = React.useState(false);

  const [payouts, setPayouts] = React.useState<Payout[]>([]);

  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = React.useState(false);
  const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(
    null,
  );

  const [filterRange, setFilterRange] = React.useState<DateRange>({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    type: "this-month",
  });

  // Initialize store if we're on a property-specific page but no property is selected
  React.useEffect(() => {
    if (propertyId && properties.length > 0) {
      const found = properties.find((p) => p.id === propertyId);
      if (found) {
        setSelectedProperty(found);
        setPayouts(found.payouts || []);
      }
    }
  }, [propertyId, properties, setSelectedProperty]);

  React.useEffect(() => {
    if (propertyId && filterRange.start && filterRange.end) {
      fetchPropertyDetails(propertyId, { 
        filter: { 
          start: filterRange.start.toISOString(), 
          end: filterRange.end.toISOString() 
        } 
      });
    }
  }, [propertyId, filterRange, fetchPropertyDetails]);

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredPayouts = React.useMemo(() => {
    return payouts.filter((payout: Payout) => {
      // Filter by propertyId if provided
      if (
        propertyId !== null &&
        String(payout.propertyId) !== String(propertyId)
      ) {
        return false;
      }

      const payoutDate = new Date(payout.date);
      if (filterRange.start && filterRange.end) {
        if (
          payoutDate < startOfMonth(new Date(filterRange.start)) ||
          payoutDate > endOfDay(new Date(filterRange.end))
        ) {
          return false;
        }
      }

      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const payoutName = (payout.name || "").toLowerCase();
        const payoutAmount = payout.amount.toString();
        if (!payoutName.includes(query) && !payoutAmount.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [filterRange, propertyId, payouts, searchQuery]);


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

  const handleRefundConfirm = async (amount: number) => {
    if (selectedPayout && propertyId) {
      try {
        setIsSaving(true);
        await refundPayoutAction(selectedPayout.id, amount);
        await fetchPropertyDetails(propertyId, { force: true });
      } catch (error) {
        console.error("Failed to refund payout:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (loading || isFetchingDetails) {
    return (
      <DashboardLayout>
        <Loader message="Loading payouts..." />
      </DashboardLayout>
    );
  }

  // Render logic...
  return (
    <DashboardLayout>
      <PageHeader
        onBack={() => router.push(`/properties/${propertyId}`)}
        title="Payouts"
        subtitle="Track your earnings and payouts."
        actions={
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems="center"
            sx={{
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <TextField
              size="small"
              placeholder="Search payouts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 250 } }}
            />
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <MonthFilter value={filterRange} onChange={setFilterRange} />
            </Box>
            <Button
              variant="outlined"
              startIcon={<FileText size={18} />}
              onClick={() => setStatsDialogOpen(true)}
              fullWidth
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Overview
            </Button>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() =>
                router.push(
                  `/properties/${propertyId as string}/payouts/create`,
                )
              }
              fullWidth
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Add Payout
            </Button>
          </Stack>
        }
      />

      {filteredPayouts.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "success.main",
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Total: {formatAmount(totalAmount)}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              fontSize: "0.9rem",
              bgcolor: (t) => alpha(t.palette.divider, 0.05),
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {filteredPayouts.length}{" "}
            {filteredPayouts.length === 1 ? "entry" : "entries"}
          </Typography>
        </Box>
      )}

      <Stack
        spacing={2}
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", mb: 4 }}
      >
        {filteredPayouts.map((payout: Payout) => {
          const isRefunded = payout.status === "REFUNDED";
          const isPartiallyRefunded = payout.status === "PARTIALLY_REFUNDED";
          const displayAmount = payout.amount - (payout.refundAmount || 0);

          return (
            <Card
              key={payout.id}
              onClick={() =>
                router.push(
                  `/properties/${propertyId}/payouts/${payout.id}/edit`,
                )
              }
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.2s",
                position: "relative",
                cursor: "pointer",
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
                spacing={{ xs: 2, sm: 3 }}
                alignItems="center"
                sx={{ flexGrow: 1, minWidth: 0 }}
              >
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.5 },
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
                    flexShrink: 0,
                  }}
                >
                  <WalletCards size={22} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 0.5, sm: 1 }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        fontSize: { xs: "0.9rem", sm: "1rem" },
                        color: isRefunded ? "text.disabled" : "text.primary",
                        textDecoration: isRefunded ? "line-through" : "none",
                        lineHeight: 1.2,
                      }}
                    >
                      {payout.name || "Property Payout"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {isRefunded && (
                        <Chip
                          label="Refunded"
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ height: 18, fontSize: "0.6rem" }}
                        />
                      )}
                      {isPartiallyRefunded && (
                        <Chip
                          label="Partial Refund"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 18, fontSize: "0.6rem" }}
                        />
                      )}
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Calendar size={14} />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {format(new Date(payout.date), "MMM d, yyyy")}
                      </Typography>
                    </Stack>
                    {isPartiallyRefunded && (
                      <Typography
                        variant="caption"
                        color="error.main"
                        sx={{ display: { xs: "none", sm: "block" } }}
                      >
                        Refunded: {formatAmount(payout.refundAmount || 0)}
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Box sx={{ textAlign: "right", ml: 1, flexShrink: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isRefunded ? "text.disabled" : "success.main",
                      fontSize: { xs: "0.95rem", sm: "1.25rem" },
                    }}
                  >
                    {formatAmount(displayAmount)}
                  </Typography>
                  {isPartiallyRefunded && (
                    <Typography
                      variant="caption"
                      color="error.main"
                      sx={{
                        display: { xs: "block", sm: "none" },
                        fontSize: "0.65rem",
                      }}
                    >
                      -{formatAmount(payout.refundAmount || 0)}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}
                >
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
                        <History size={22} />
                      </IconButton>
                    </Tooltip>
                  )}

                  {!isRefunded && !isPartiallyRefunded && (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title="Refund Payout" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => handleRefundClick(e, payout)}
                          sx={{
                            color: "text.secondary",
                            ml: 0.5,
                            "&:hover": {
                              color: "error.main",
                              bgcolor: (theme) =>
                                alpha(theme.palette.error.main, 0.08),
                            },
                          }}
                        >
                          <Undo2 size={22} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Stack>
            </Card>
          );
        })}

        {filteredPayouts.length === 0 && (
          <EmptyState
            icon={WalletCards}
            title="No payouts found"
            description="Try adjusting your filter or record a new payout to get started."
          />
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
        onConfirm={async () => {
          if (selectedPayout && propertyId) {
            try {
              setIsSaving(true);
              await revertRefundAction(selectedPayout.id);
              await fetchPropertyDetails(propertyId, { force: true });
            } catch (error) {
              console.error("Failed to revert refund:", error);
            } finally {
              setIsSaving(false);
            }
          }
          setRevertDialogOpen(false);
        }}
      />

      <YearlyStatsDialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
        propertyId={propertyId}
        type="payouts"
      />
    </DashboardLayout>
  );
}
